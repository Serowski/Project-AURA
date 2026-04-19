#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/conn.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/adc.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/drivers/pwm.h>
#include <stdio.h>
#include <string.h>
#include <zephyr/settings/settings.h>

LOG_MODULE_REGISTER(bt_multi_sensor, LOG_LEVEL_INF);

#define DEVICE_NAME CONFIG_BT_DEVICE_NAME
#define DEVICE_NAME_LEN (sizeof(DEVICE_NAME) - 1)

static const struct gpio_dt_spec trig_gpio = GPIO_DT_SPEC_GET(DT_PATH(zephyr_user), trig_gpios);
static const struct gpio_dt_spec echo_gpio = GPIO_DT_SPEC_GET(DT_PATH(zephyr_user), echo_gpios);
static const struct adc_dt_spec adc_chan0 = ADC_DT_SPEC_GET_BY_IDX(DT_PATH(zephyr_user), 0);
static const struct device *temp_dev = DEVICE_DT_GET(DT_NODELABEL(temp));
static const struct pwm_dt_spec pwm_buzzer = PWM_DT_SPEC_GET(DT_ALIAS(buzzer));

static struct bt_conn *current_conn;

/* UUIDs */
static struct bt_uuid_128 my_service_uuid = BT_UUID_INIT_128(
    BT_UUID_128_ENCODE(0x12345678, 0x1234, 0x5678, 0x1234, 0x567812345678));

static struct bt_uuid_128 my_char_uuid = BT_UUID_INIT_128(
    BT_UUID_128_ENCODE(0x87654321, 0x4321, 0x8765, 0x4321, 0x876543218765));

BT_GATT_SERVICE_DEFINE(my_service,
    BT_GATT_PRIMARY_SERVICE(&my_service_uuid),
    BT_GATT_CHARACTERISTIC(&my_char_uuid.uuid,
                   BT_GATT_CHRC_NOTIFY,
                   BT_GATT_PERM_NONE,
                   NULL, NULL, NULL),
    BT_GATT_CCC(NULL, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),
);

static const struct bt_data ad[] = {
    BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),
    BT_DATA_BYTES(BT_DATA_UUID16_ALL, BT_UUID_16_ENCODE(BT_UUID_DIS_VAL)),
    BT_DATA(BT_DATA_NAME_COMPLETE, DEVICE_NAME, DEVICE_NAME_LEN),
};

static void buzzer_on(uint32_t freq_hz)
{
    uint32_t period_ns = 1000000000U / freq_hz;
    uint32_t pulse_ns  = period_ns / 2U;
    pwm_set_dt(&pwm_buzzer, period_ns, pulse_ns);
}

static void buzzer_off(void)
{
    pwm_set_pulse_dt(&pwm_buzzer, 0);
}

static void adv_work_handler(struct k_work *work);
static K_WORK_DEFINE(adv_work, adv_work_handler);

static void adv_work_handler(struct k_work *work)
{
    int err = bt_le_adv_start(BT_LE_ADV_PARAM(BT_LE_ADV_OPT_CONN,
                              BT_GAP_ADV_FAST_INT_MIN_2,
                              BT_GAP_ADV_FAST_INT_MAX_2,
                              NULL),
                              ad, ARRAY_SIZE(ad), NULL, 0);
    if (err) {
        LOG_ERR("Adv failed (err %d)", err);
    } else {
        LOG_INF("Adv started");
    }
}

static void start_advertising(void)
{
    k_work_submit(&adv_work);
}

static void connected(struct bt_conn *conn, uint8_t err)
{
    if (!err) {
        LOG_INF("Connected");
        current_conn = bt_conn_ref(conn);
        
        /* Dwa szybkie zabrzęczenia */
        buzzer_on(2000);
        k_sleep(K_MSEC(100));
        buzzer_off();
        k_sleep(K_MSEC(100));
        buzzer_on(2000);
        k_sleep(K_MSEC(100));
        buzzer_off();
    }
}

static void disconnected(struct bt_conn *conn, uint8_t reason)
{
    LOG_INF("Disconnected (reason %u)", reason);
    if (current_conn) {
        bt_conn_unref(current_conn);
        current_conn = NULL;
    }
}

static void recycled_cb(void)
{
    LOG_INF("Connection object released, restarting advertising");
    start_advertising();
}

BT_CONN_CB_DEFINE(conn_callbacks) = {
    .connected    = connected,
    .disconnected = disconnected,
    .recycled     = recycled_cb,
};

static float measure_distance(void)
{
    uint32_t start_time, stop_time;
    unsigned int key = irq_lock();

    gpio_pin_set_dt(&trig_gpio, 0);
    k_busy_wait(5);
    gpio_pin_set_dt(&trig_gpio, 1);
    k_busy_wait(10);
    gpio_pin_set_dt(&trig_gpio, 0);

    uint32_t wait_start = k_cycle_get_32();
    while (gpio_pin_get_dt(&echo_gpio) == 0) {
        if (k_cyc_to_us_near32(k_cycle_get_32() - wait_start) > 20000) {
            irq_unlock(key);
            return -1.0f;
        }
    }
    start_time = k_cycle_get_32();

    while (gpio_pin_get_dt(&echo_gpio) == 1) {
        if (k_cyc_to_us_near32(k_cycle_get_32() - start_time) > 30000) break;
    }
    stop_time = k_cycle_get_32();
    irq_unlock(key);

    return ((float)k_cyc_to_us_near64(stop_time - start_time) * 0.0343f) / 2.0f;
}

static int32_t read_light_mv(void)
{
    int err;
    int16_t buf;
    struct adc_sequence seq = {
        .buffer = &buf,
        .buffer_size = sizeof(buf),
    };

    err = adc_sequence_init_dt(&adc_chan0, &seq);
    if (err < 0) {
        LOG_ERR("ADC sequence init failed (%d)", err);
        return -1;
    }

    err = adc_read(adc_chan0.dev, &seq);
    if (err < 0) {
        LOG_ERR("ADC read failed (%d)", err);
        return -1;
    }

    int32_t val_mv = (int32_t)buf;
    err = adc_raw_to_millivolts_dt(&adc_chan0, &val_mv);
    if (err < 0) {
        LOG_WRN("ADC conversion to mV failed (%d)", err);
        return -1;
    }

    return val_mv;
}

static float read_die_temp(void)
{
    struct sensor_value val;

    if (!device_is_ready(temp_dev)) {
        LOG_ERR("TEMP device not ready");
        return -1.0f;
    }

    if (sensor_sample_fetch(temp_dev) < 0) {
        LOG_ERR("TEMP fetch failed");
        return -1.0f;
    }

    sensor_channel_get(temp_dev, SENSOR_CHAN_DIE_TEMP, &val);
    return sensor_value_to_float(&val);
}

int main(void)
{
    char combined_msg[64];

    if (!gpio_is_ready_dt(&trig_gpio)) {
        LOG_ERR("Trig GPIO not ready");
        return 0;
    }
    if (!gpio_is_ready_dt(&echo_gpio)) {
        LOG_ERR("Echo GPIO not ready");
        return 0;
    }
    if (!adc_is_ready_dt(&adc_chan0)) {
        LOG_ERR("ADC device not ready");
        return 0;
    }
    if (!device_is_ready(temp_dev)) {
        LOG_ERR("Internal TEMP sensor not ready");
    }
    if (!pwm_is_ready_dt(&pwm_buzzer)) {
        LOG_ERR("PWM buzzer not ready");
        return 0;
    }

    gpio_pin_configure_dt(&trig_gpio, GPIO_OUTPUT_INACTIVE);
    gpio_pin_configure_dt(&echo_gpio, GPIO_INPUT);

    int err = adc_channel_setup_dt(&adc_chan0);
    if (err < 0) {
        LOG_ERR("ADC channel setup failed (%d)", err);
        return 0;
    }

    if (bt_enable(NULL)) {
		LOG_ERR("BT enable failed");
		return 0;
	}

	if (IS_ENABLED(CONFIG_BT_SETTINGS)) {
		settings_load();
	}

	start_advertising();

    while (1) {
        float dist = measure_distance();
        int32_t light = read_light_mv() + 100;
        float die_temp = read_die_temp();

        /* Szybszy dwutonowy dźwięk poniżej 10 cm */
        if (dist > 0 && dist < 10.0f) {
            buzzer_on(2300);
            k_sleep(K_MSEC(75));
            buzzer_on(2200);
            k_sleep(K_MSEC(75));
            buzzer_off();
            k_sleep(K_MSEC(100)); /* Krótki odstęp w trybie alarmu */
        } else {
            buzzer_off();
            k_sleep(K_SECONDS(1)); /* Normalny tryb: co 1 sekundę */
        }

        if (dist < 0) {
            snprintf(combined_msg, sizeof(combined_msg),
                     "ERR.0;%04d;%.2f", (int)light, (double)die_temp);
        } else {
            snprintf(combined_msg, sizeof(combined_msg),
                     "%05.1f;%04d;%.2f", (double)dist, (int)light, (double)die_temp);
        }

        LOG_INF("Data: %s", combined_msg);

        if (current_conn) {
            bt_gatt_notify(current_conn, &my_service.attrs[2],
                           combined_msg, strlen(combined_msg));
        }
    }

    return 0;
}