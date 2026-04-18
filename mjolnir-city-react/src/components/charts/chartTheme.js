/**
 * Shared Chart.js theming (colors, defaults).
 * Imported once in main.jsx-adjacent code, then reused by every chart.
 */
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
Chart.defaults.color = '#8b95ab';
Chart.defaults.font.family = 'Inter, system-ui';
Chart.defaults.font.size = 11;

export const COLORS = {
  gold:       '#d6a85c',
  goldSoft:   'rgba(214,168,92,.35)',
  goldGlass:  'rgba(214,168,92,.08)',
  teal:       '#4fb8b0',
  tealSoft:   'rgba(79,184,176,.25)',
  frost:      '#7fb6d9',
  frostSoft:  'rgba(127,182,217,.25)',
  ember:      '#e06a3a',
  emberSoft:  'rgba(224,106,58,.25)',
  violet:     '#8779d6',
  grid:       'rgba(214,168,92,0.06)',
  tick:       '#8b95ab',
  panelBg:    '#0b1220',
};

export const axisGrid = { grid: { color: COLORS.grid } };
