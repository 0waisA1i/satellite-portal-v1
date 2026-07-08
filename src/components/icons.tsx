const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  viewBox: "0 0 24 24",
  className: "h-[14px] w-[14px]",
} as const;

export const LockIcon = (props: { className?: string }) => (
  <svg {...base} className={props.className ?? base.className}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const InfoIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const SparkIcon = () => (
  <svg {...base}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </svg>
);

export const PenIcon = () => (
  <svg {...base}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const CrmIcon = () => (
  <svg {...base}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
  </svg>
);

export const ArchiveIcon = () => (
  <svg {...base}>
    <path d="M21 8V21H3V8" />
    <path d="M23 3H1v5h22V3z" />
    <path d="M10 12h4" />
  </svg>
);

export const RestoreIcon = () => (
  <svg {...base}>
    <path d="M3 12a9 9 0 1 0 2.6-6.36L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
