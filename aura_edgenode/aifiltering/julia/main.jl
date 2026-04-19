include("mqttReciever.jl")
include("kalman.jl")

BROKER = "local_mqtt"
PORT = 1883
RAW_TOPIC = "sensors/raw"
FILTERED_TOPIC = "sensors/filtered"

global device_registry = Dict{String, DeviceFilters}()

function main()
    channel = Channel(100)
    client = mqttconnect(BROKER, "", "", PORT)
    @async listen(client, channel, RAW_TOPIC)
    
    println("🚀 Julia Multi-Sensor Filter Service is RUNNING...")
    
    while true
        raw_msg = take!(channel)
        dev_id = String(get(raw_msg, "device", "unknown"))
        sensors = get(raw_msg, "data", Dict{String, Any}())

        if !haskey(device_registry, dev_id)
            println("INFO: New device detected: $dev_id. Initializing filters.")
            device_registry[dev_id] = init_device(sensors)
        end

        df = device_registry[dev_id]

        f_dist = update_1d!(df.dist, Float64(get(sensors, "dist", 0.0)))
        f_temp = update_1d!(df.temp, Float64(get(sensors, "temp", 0.0)))
        f_light = update_1d!(df.light, Float64(get(sensors, "light", 0.0)))
        f_hum = update_1d!(df.humidity, Float64(get(sensors, "humidity", 0.0)))
        f_press = update_1d!(df.pressure, Float64(get(sensors, "pressure", 0.0)))

        result = Dict(
            "ts" => get(raw_msg, "ts", time()),
            "device" => dev_id,
            "raw" => sensors,
            "filtered" => Dict(
                "dist" => round(f_dist, digits=2),
                "temp" => round(f_temp, digits=2),
                "light" => round(f_light, digits=2),
                "humidity" => round(f_hum, digits=2),
                "pressure" => round(f_press, digits=2)
            ),
            "meta" => Dict(
                "node" => "edge_julia_01"
            )
        )
        
        publish_filtered(client, FILTERED_TOPIC, result)
    end
end

main()
