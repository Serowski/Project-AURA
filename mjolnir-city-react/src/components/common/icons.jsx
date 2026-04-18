/**
 * Tiny hand-rolled icon set (no external dep).
 * Each icon accepts `size` and `className`.
 */
const base = (size, extra) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
  ...extra,
});

export const HammerSigil = ({ size = 24, className }) => (
  <svg className={className} {...base(size)}>
    <rect x="4" y="3" width="16" height="7" rx="1" />
    <path d="M12 10v11" /><path d="M9 21h6" /><path d="M8 6h8" />
  </svg>
);

export const BellIcon = ({ size = 18, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const ClockIcon = ({ size = 18, className }) => (
  <svg className={className} {...base(size)}>
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);

export const UserIcon = ({ size = 20, className }) => (
  <svg className={className} {...base(size)}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3.2" />
    <path d="M5.5 19a7 7 0 0 1 13 0" />
  </svg>
);

export const LonghouseIcon = ({ size = 18, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M3 12l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" />
  </svg>
);

export const YggdrasilIcon = ({ size = 18, className }) => (
  <svg className={className} {...base(size)}>
    <circle cx="12" cy="4" r="2" /><circle cx="4" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" /><circle cx="12" cy="12" r="2" />
    <path d="M12 6v4M10.6 13.4 5.4 18.6M13.4 13.4l5.2 5.2" />
  </svg>
);

export const BifrostIcon = ({ size = 18, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M3 7c3 0 3 2 6 2s3-2 6-2 3 2 6 2" />
    <path d="M3 12c3 0 3 2 6 2s3-2 6-2 3 2 6 2" />
    <path d="M3 17c3 0 3 2 6 2s3-2 6-2 3 2 6 2" />
  </svg>
);

export const ShieldIcon = ({ size = 18, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
  </svg>
);

export const ScrollIcon = ({ size = 18, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M8 3h11v15a3 3 0 0 1-3 3H8" />
    <path d="M8 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3" />
    <path d="M9 7h7M9 11h7M9 15h5" />
  </svg>
);

export const SensorIcon = ({ size = 14, className }) => (
  <svg className={className} {...base(size, { strokeWidth: 2 })}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
  </svg>
);

export const ChartIcon = ({ size = 14, className }) => (
  <svg className={className} {...base(size, { strokeWidth: 2 })}>
    <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-6" />
  </svg>
);

export const MapIcon = ({ size = 14, className }) => (
  <svg className={className} {...base(size, { strokeWidth: 2 })}>
    <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" />
    <path d="M9 3v15M15 6v15" />
  </svg>
);

export const DragonIcon = ({ size = 24, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M12 3c1 2 3 3 3 5.5S13 12 12 15c-1-3-3-4-3-6.5S11 5 12 3Z" />
    <path d="M7 14c-1.5 3-1 6 2 7M17 14c1.5 3 1 6-2 7" />
  </svg>
);

export const WindIcon = ({ size = 24, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M3 8h13a3 3 0 1 0-3-3" />
    <path d="M3 14h17a3 3 0 1 1-3 3" />
    <path d="M3 11h9" />
  </svg>
);

export const EchoIcon = ({ size = 24, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M4 9v6M8 6v12M12 3v18M16 6v12M20 9v6" />
  </svg>
);

export const BoltIcon = ({ size = 24, className }) => (
  <svg className={className} {...base(size)}>
    <path d="M13 2 4 14h7l-2 8 10-14h-7l1-6Z" />
  </svg>
);

export const SparklesIcon = ({ size = 44, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="currentColor">
    <path d="M24 4l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8zM38 22l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4zM10 24l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
  </svg>
);

export const TerminalIcon = ({ size = 16, className }) => (
  <svg className={className} {...base(size, { strokeWidth: 1.8 })}>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M7 9l3 2-3 2M13 13h4" />
  </svg>
);
