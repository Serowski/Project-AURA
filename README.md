# Bluetooth Peripheral dla nRF54L15 DK

Ten projekt implementuje podstawową funkcjonalność urządzenia Bluetooth Low Energy (BLE) w roli peryferyjnej (Peripheral) dla płytki nRF54L15 DK przy użyciu Zephyr RTOS i nRF Connect SDK.

## Jak działa to rozwiązanie?

Rozwiązanie opiera się na trzech kluczowych elementach: konfiguracji stosu Bluetooth, danych rozgłoszeniowych oraz logice inicjalizacji w aplikacji.

### 1. Konfiguracja Stosu (prj.conf)
Plik konfiguracyjny włącza niezbędne komponenty systemu:
*   `CONFIG_BT`: Włącza obsługę stosu Bluetooth.
*   `CONFIG_BT_PERIPHERAL`: Ustawia urządzenie w roli peryferyjnej (umożliwia połączenia przychodzące).
*   `CONFIG_BT_DEVICE_NAME`: Definiuje nazwę, pod którą płytka będzie widoczna (np. w telefonie).
*   `CONFIG_BT_L2CAP_TX_MTU` & `CONFIG_BT_BUF_ACL_TX_SIZE`: Optymalizują bufory dla lepszej wydajności przesyłu danych.

### 2. Rozgłaszanie (Advertising)
Aby urządzenie było widoczne dla innych (telefonów, laptopów), musi wysyłać pakiety rozgłoszeniowe.
*   **Flagi**: Używamy flagi `BT_LE_AD_GENERAL`, co oznacza, że urządzenie jest w trybie ogólnego rozgłaszania (widoczne dla wszystkich skanerów).
*   **Nazwa**: W pakiecie danych przesyłana jest pełna nazwa urządzenia (`BT_DATA_NAME_COMPLETE`), dzięki czemu użytkownik widzi "nRF54L15_Peripheral" zamiast samego adresu MAC.

### 3. Logika Aplikacji (main.c)
Kod w języku C realizuje następujący scenariusz:
1.  **Inicjalizacja**: Wywołanie `bt_enable(NULL)` uruchamia kontroler i hosta Bluetooth.
2.  **Callbacki połączenia**: Makro `BT_CONN_CB_DEFINE` rejestruje funkcje, które zostaną wywołane automatycznie, gdy ktoś połączy się z płytką lub od niej rozłączy. Pozwala to na śledzenie stanu urządzenia w logach.
3.  **Uruchomienie rozgłaszania**: Funkcja `bt_le_adv_start` z parametrem `BT_LE_ADV_OPT_CONN` nakazuje kontrolerowi rozpoczęcie nadawania sygnału i akceptowanie prób połączenia.

## Szczegóły techniczne nRF54L15
Płytka nRF54L15 jest nowoczesnym układem, który domyślnie korzysta z technologii **TF-M (Trusted Firmware-M)** dla bezpieczeństwa. Dlatego proces budowania generuje wiele obrazów (sysbuild), a finalny wsad zawiera w sobie zarówno bezpieczny runtime, jak i Twoją aplikację Bluetooth.

## Testowanie
1.  Po wgraniu kodu, dioda na płytce (jeśli skonfigurowana) lub logi UART (115200 bps) potwierdzą start.
2.  Użyj aplikacji **nRF Connect for Mobile** (dostępnej na Android/iOS).
3.  Kliknij "Scan" i znajdź urządzenie o nazwie **nRF54L15_Peripheral**.
4.  Po kliknięciu "Connect", płytka przestanie rozgłaszać (zniknie z listy skanowania) i nawiąże bezpieczne połączenie.
