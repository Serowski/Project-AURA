import { useEffect, useState } from 'react';
import { WISDOMS } from '../data/wisdoms.js';
import { WISDOM_INTERVAL_MS } from '../config/thresholds.js';

export function useWisdomRotator() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WISDOMS.length);
        setFade(true);
      }, 400);
    }, WISDOM_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return { quote: WISDOMS[index], fade };
}
