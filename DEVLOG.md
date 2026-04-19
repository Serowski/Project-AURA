# UI/UX pass + sensor logic fixes

## TL;DR

Dashboard dostał kompleksowy lifting wizualny, naprawiono dwa logiczne bugi w klasyfikacji metryk (`WARM` przy 0°C, `LOUD` przy pomiarze odległości), Rune-Log Feed wreszcie się wypełnia, a tło z Wikingów na ulicy Krakowa jest faktycznie widoczne.

---

## Zmiany

### Tło / layout

- Tło `bg-main-page.jpg` przeniesione z CSS body (gdzie nie działało przez nadpisujący gradient + nieprzezroczyste panele) na prawdziwy element `<img>` w `App.jsx`. Gradient overlay `rgba(16,18,22, 0.72→0.85)`, `object-position: center 15%` żeby pokazywać kościół Mariacki, nie tłum.
- Zmniejszona nieprzezroczystość paneli: `--bg-2` z `0.75` → `0.55`, `--bg-3` z `0.7` → `0.5`. Panele teraz „oddychają" — widać tło między nimi i przez nie.
- Złagodzony czerwony `critical-overlay` (`0.4` → `0.18`) — alarm „DEGRADING" już nie zalewa całego ekranu.

### PageHeader

- Usunięty cały blok `Frost Resistance / DEGRADING`. Stan critical-frost dalej działa (overlay), po prostu nie ma już duplikatu w nagłówku.
- `<h1>` dostał gradient tekstowy (jasne złoto → amber → brąz) + glow + cienką złotą linię pod spodem.
- Eyebrow `SYSTEM STATUS: ACTIVE` ma teraz porządny `margin-bottom: 18px` + jest blokiem (wcześniej `inline-block` powodował że wpadał w jedną linię z h1).

### Visual polish (CSS)

Wszystko w jednym bloku na końcu `index.css`:

- **Glow** na dużych liczbach KPI (`.card-value`, `.sensor-card__val`).
- **Hover halo** na kartach/panelach: złota krawędź + zewnętrzny i wewnętrzny shadow.
- **Shimmer line** przelatująca przez kartę przy hover.
- **Runiczne rogi** ciemniejsze domyślnie, większe i jaśniejsze przy hover.
- **Pulsująca aura** na aktywnej zakładce (3.2s ease).
- **Złoty seam** pod TopBarem (gradient zanikający po bokach).
- **Drop-shadow glow** na brand sigil (młot Thora).
- **Czerwona poświata** pod stanami `--warn`.
- **Ulepszony scrollbar** w Rune-Log (gradient brąz→złoto).
- **Fade-in animation** kart przy pierwszym renderze.

---

## Logika sensorów

### Threshold classification fixes

W `utils/thresholdCheck.js` defaultowy `return` powodował, że 0°C dawało `WARM`, a 0 lux dawało `PEAK`. Teraz:

| Sensor | Skala badgey |
|---|---|
| **Temperatura (dragon)** | `FROZEN` (<10) → `COOL` (10-18) → `WARM` (18-28) → `HOT` (28-35) → `CRIT` (≥35) |
| **Natężenie światła (forge)** | `IDLE` (<5%) → `STEADY` (5-30%) → `PEAK` (30-95%) → `SURGE` (95-98%) → `OVERLOAD` (≥98%) |

Progi w `config/thresholds.js`.

### Karta „Odległość" — przemodelowanie

Wcześniej karta używała ikony fal dźwiękowych (`EchoIcon`) i klasyfikacji hałasu (`echo: warn 70 dB, crit 85 dB`), więc 188 cm pokazywało `LOUD`. Bug-przeoczenie po rebrandzie metryki z echa → odległości.

- Nowa `DistanceIcon` w `icons.jsx` (linia + strzałki).
- Nowa klasyfikacja `dist`: `BLOCKED` (≤30 cm) → `CLOSE` (≤100 cm) → `MID` (≤250 cm) → `CLEAR` (>250 cm).
- Progi `dist: { blocked: 30, close: 100, mid: 250 }`. Stary próg `echo` zostawiony dla back-compat.
- `EchoesCard` używa teraz `DistanceIcon`, `classifyKpi('dist', value)`, dodany `barPercent` ze skalą 0-400 cm i `barVariant="frost"`.

### Karta „Wilgotność" — ikona

`WindIcon` (fale wiatru) → `DropIcon` (kropla). Kolor ikony z `var(--teal)` na `var(--frost)` — jaśniejszy błękit lepiej pasuje do wody.

---

## Rune-Log Feed

Wcześniej feed był pusty, bo był aktualizowany tylko gdy serwer wysyłał wiadomość typu `log` / `system_log`. Strumień zawiera same `sensor_update`.

### Auto-logowanie zmian stanu

W `SensorsContext.jsx`, w `applyLatestToKpi`, dodana funkcja `logBadgeTransitions` — przy każdym `sensor_update` porównuje aktualny badge każdej z 4 metryk z poprzednim (przechowywanym w `useRef`). Jeśli zmienił się — emituje wpis:

```
Odległość: MID → CLOSE (78.2 cm).    [SENSOR: CLOSE]
```

Wariant tagu (`crit`/`warm`/`teal`/`frost`/`ok`) odpowiada nowemu stanowi, więc kolor wpisu pasuje do alarmu.

### Logi połączenia

Dodane wpisy lifecycle WebSocketa:

- `LINK: UP` (ok, zielony) — przy `setConnected(true)`.
- `LINK: DOWN` (warn, żółty) — przy `onClose`.
- `LINK: ERROR` (danger, czerwony) — przy `onError`.

Feed teraz ożywa od razu po wejściu na stronę, nawet zanim spłynie pierwszy `sensor_update`.

---

## Pliki zmodyfikowane

```
mjolnir-city-react/
├── public/images/bg-main-page.jpg          (już istniał, teraz faktycznie używany)
├── src/
│   ├── App.jsx                              (img + overlay)
│   ├── components/
│   │   ├── cards/
│   │   │   ├── EchoesCard.jsx               (DistanceIcon, dist classifier)
│   │   │   └── SpiritOfAirCard.jsx          (DropIcon)
│   │   ├── common/icons.jsx                 (DropIcon, DistanceIcon)
│   │   └── panels/PageHeader.jsx            (- frost block)
│   ├── config/thresholds.js                 (extended dragon/forge, new dist)
│   ├── context/SensorsContext.jsx           (badge transition logging, link logs)
│   ├── styles/
│   │   ├── index.css                        (header, polish pass, layout fixes)
│   │   └── variables.css                    (--bg-2, --bg-3 opacity)
│   └── utils/thresholdCheck.js              (FROZEN/COOL/STEADY/IDLE, dist case)
```

## Breaking changes

Brak. `echo` jako klucz KPI dalej działa (mapuje się w `applyLatestToKpi` z `f.dist`), klasyfikator `case 'echo'` deleguje do `case 'dist'`.

## TODO / next

- Sparkline w każdej karcie KPI (mini wykres ostatnich 20 odczytów + delta).
- Włączenie sidebara — komponent `Sidebar.jsx` istnieje, ale `--sidebar-w: 0px` go ukrywa.
- Skeleton loading state zamiast `0` przed pierwszym `sensor_update`.
- Throttle dla badge transitions (jeśli wartości przy progu oscylują).
- Custom 404 / connection-lost screens z nordycką ilustracją.
