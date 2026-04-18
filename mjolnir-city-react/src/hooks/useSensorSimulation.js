import { useEffect, useRef } from 'react';
import { fluctuate } from '../utils/fluctuate.js';
import { THRESHOLDS, TICK_INTERVAL_MS } from '../config/thresholds.js';

/**
 * useSensorSimulation
 *
 * Drives random-walk updates for KPI + extra sensors every
 * TICK_INTERVAL_MS. Also raises alarms when thresholds are crossed.
 *
 * TODO(backend): delete this hook in production and replace with:
 *
 *   useEffect(() => {
 *     const ws = openSensorStream({
 *       onMessage: (msg) => { setKpi(msg.kpi); setAtmo(msg.atmo); ... }
 *     });
 *     return () => ws.close();
 *   }, []);
 */
export function useSensorSimulation({ setKpi, setAtmo, setExtra, fireAlarm }) {
  // Keep latest refs so the interval callback is stable.
  const fireRef = useRef(fireAlarm);
  fireRef.current = fireAlarm;

  useEffect(() => {
    const tick = () => {
      setKpi((prev) => {
        const next = {
          dragon: +fluctuate(prev.dragon, 1.4, 18, 40).toFixed(1),
          air:    Math.round(fluctuate(prev.air,    2.5, 35, 100)),
          echo:   Math.round(fluctuate(prev.echo,   6,   25, 100)),
          forge:  Math.round(fluctuate(prev.forge,  3,   40, 100)),
        };
        // Evaluate alarms based on the fresh values.
        checkAlarms(next, fireRef.current);
        return next;
      });

      setAtmo((prev) => {
        const n2 = +fluctuate(prev.n2, 0.3, 75, 80).toFixed(1);
        const o2 = +fluctuate(prev.o2, 0.25, 19, 23).toFixed(1);
        const runes = +(100 - n2 - o2).toFixed(1);
        return { n2, o2, runes };
      });

      setExtra((prev) => prev.map((s) => {
        const amp = (s.max - s.min) * 0.05;
        const val = +fluctuate(+s.val, amp, s.min, s.max).toFixed(1);
        return { ...s, val };
      }));
    };

    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [setKpi, setAtmo, setExtra]);
}

function checkAlarms(kpi, fire) {
  if (!fire) return;
  if (kpi.dragon >= THRESHOLDS.dragon.crit) {
    fire('dragon', `Ragnarök! Dragon Breath przekroczył ${THRESHOLDS.dragon.crit}°C — smok rozpala kuźnię.`, 'ACTION: AUTO-COOLING ENGAGE');
  }
  if (kpi.air <= THRESHOLDS.air.critLow) {
    fire('air', `Spirit of Air poniżej ${THRESHOLDS.air.critLow} — zatrute powietrze nad longhallami.`, 'ACTION: FILTER RITE');
  }
  if (kpi.echo >= THRESHOLDS.echo.crit) {
    fire('echo', `Echoes of Midgard ryczą (${kpi.echo} dB) — tarczownicy do bram!`, 'ACTION: VALKYRIE DISPATCH');
  }
  if (kpi.forge >= THRESHOLDS.forge.crit) {
    fire('forge', `Forge Energy przekracza ${THRESHOLDS.forge.crit}% — serce kuźni bliskie przegrzania.`, 'ACTION: DAMPEN CORE');
  }
}
