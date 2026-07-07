import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
  size?: number;
}

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const HomeIcon = ({ filled, size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    {filled ? (
      <path
        d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z"
        fill="currentColor"
        stroke="none"
      />
    ) : (
      <path d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3.5v-6h3v6H17a1 1 0 0 0 1-1v-9" />
    )}
  </svg>
);

export const SearchIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const PlusSquareIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const HeartIcon = ({ filled, size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path
      d="M12 20.2s-7.6-4.6-9.9-9.2C.5 7.2 2.4 3.8 5.8 3.4c2-.3 3.7.7 4.9 2.4a.4.4 0 0 0 .6 0c1.2-1.7 2.9-2.7 4.9-2.4 3.4.4 5.3 3.8 3.7 7.6-2.3 4.6-9.9 9.2-9.9 9.2Z"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

export const CommentIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5Z" />
  </svg>
);

export const RepostIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6 4v9a3 3 0 0 0 3 3h9M18 20v-9a3 3 0 0 0-3-3H6" />
    <path d="m17 12 3-3-3-3M7 12 4 15l3 3" />
  </svg>
);

export const ShareIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="M16 6 12 2 8 6M12 2v14" />
  </svg>
);

export const BookmarkIcon = ({ filled, size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path
      d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

export const BellIcon = ({ filled, size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path
      d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z"
      fill={filled ? "currentColor" : "none"}
    />
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </svg>
);

export const MailIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const UserIcon = ({ filled, size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="8.2" r="3.6" fill={filled ? "currentColor" : "none"} />
    <path
      d="M4.5 20c1.4-3.7 4.5-5.6 7.5-5.6s6.1 1.9 7.5 5.6"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

export const SettingsIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1h-.2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.9 8a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9.5a1.7 1.7 0 0 0 1-1.6v-.2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.3.5.9 1 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" />
  </svg>
);

export const BookmarkSavedIcon = BookmarkIcon;

export const MoreIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const MoreHorizontalIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const XIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const ImageIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 17 5-5 4 4 3-3 4 4" />
  </svg>
);

export const VideoIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="2.5" y="5.5" width="13" height="13" rx="2.5" />
    <path d="m21.5 8.5-6 3.5 6 3.5v-7Z" fill="currentColor" stroke="none" />
  </svg>
);

export const SunIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
  </svg>
);

export const MoonIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
  </svg>
);

export const LockIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);

export const ShieldIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.5 19 6v6c0 4.5-3 7.7-7 8.5-4-.8-7-4-7-8.5V6l7-2.5Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const TrendingIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="m3 17 6-6 4 4 8-9" />
    <path d="M15 6h6v6" />
  </svg>
);

export const LogoIcon = ({ size = 28, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" {...p}>
    <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
    <path
      d="M10 21c0-5.5 3-9.5 6-9.5s6 2.2 6 6.3-3 5.2-5.2 5.2-3-1.1-3-3 1.2-3.1 3.2-3.1"
      stroke="white"
      strokeWidth="2.1"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const MenuIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const BarChartIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

export const CreateConnectIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p} strokeWidth={1.6}>
    <path d="M12 4a8 8 0 0 1 7.5 10.8c-.8 2-2.5 3.7-4.7 4.5" />
    <path d="M8.5 19.5a8 8 0 0 1-4-5" />
    <path d="M4.8 10A8 8 0 0 1 9 4.4" />
    <path d="M15 17l3 3 3-3" />
  </svg>
);

export const FollowSuggestIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p} strokeWidth={1.6}>
    <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
    <path d="M20 19a8 8 0 0 0-16 0" />
    <path d="M19 8l2 2 2-2" />
    <path d="M21 10V6" />
  </svg>
);

export const SendIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="m4 12 16-8-6 16-3-6-7-2Z" />
  </svg>
);

export const ChevronDownIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const PaperclipIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.2 9.19a1 1 0 01-1.41-1.41l8.49-8.49" />
  </svg>
);

export const FileIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

export const InfoIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const SmileIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </svg>
);

export const CameraIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
    <circle cx="12" cy="13" r="3.4" />
  </svg>
);
