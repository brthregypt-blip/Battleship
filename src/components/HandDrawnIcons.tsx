import React from 'react';

// Hand-drawn sketchy red 'X' for Hit
export const PenHitCross: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`animate-in zoom-in duration-200 rotate-[4deg] ${className}`}
  >
    <path
      d="M8 8 C 15 15, 25 25, 32 32 M9 6 C 16 15, 24 23, 31 34"
      stroke="#cc3333"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 8 C 25 15, 15 25, 8 32 M31 9 C 24 17, 16 24, 9 32"
      stroke="#cc3333"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="20" r="1.8" fill="#991f1f" />
  </svg>
);

// Hand-drawn navy ballpoint dot & swirl for Miss
export const PenMissDot: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 22,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`animate-in zoom-in duration-150 ${className}`}
  >
    <circle cx="18" cy="18" r="4.5" fill="#1a3a5f" />
    <path
      d="M17 16 C 18 15, 20 16, 19 19 C 18 21, 15 20, 16 17"
      stroke="#0f233a"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M10 18 C 10 13.5, 13.5 10, 18 10 C 22.5 10, 26 13.5, 26 18 C 26 22.5, 22.5 26, 18 26 C 13.5 26, 10 22.5, 10 18"
      stroke="#d1e4f0"
      strokeWidth="1.8"
      strokeDasharray="2 3"
      strokeLinecap="round"
    />
  </svg>
);

// Hand-drawn Sunk Ship Scribble Overlay
export const SunkScribble: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
}> = ({ className = '' }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    fill="none"
  >
    <path
      d="M5 10 Q 50 85, 95 90 M10 90 Q 50 15, 90 10 M15 50 Q 80 45, 85 55 M5 30 L 95 70 M5 70 L 95 30"
      stroke="#cc3333"
      strokeWidth="2.8"
      strokeLinecap="round"
      opacity="0.85"
    />
  </svg>
);

// Hand-drawn Airplane / Bomber for Airstrike
export const PlaneDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.8 19.2 L 16 11 L 22 8 L 20 6 L 13 8 L 10 3 L 8 4 L 9.5 9 L 4 11 L 2 9.5 L 1.5 11.5 L 4.5 13.5 L 3.5 18 L 5 18.5 L 7 14 L 13 14 L 14.5 19.5 Z" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

// Hand-drawn Torpedo Doodle
export const TorpedoDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Torpedo cylindrical body with rounded nose */}
    <path d="M4 12 C 4 9, 18 9, 21 12 C 18 15, 4 15, 4 12 Z" fill="currentColor" fillOpacity="0.15" />
    {/* Rear fins */}
    <path d="M4 9 L 2 7 M4 15 L 2 17 M2 10 L 2 14" />
    {/* Propeller wake bubble rings */}
    <circle cx="11" cy="12" r="1.5" strokeDasharray="1 1" />
    <circle cx="15" cy="12" r="1" strokeDasharray="1 1" />
  </svg>
);

// Hand-drawn Rocket / Missile in Flight
export const RocketDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4.5 16.5 C 5 13, 10 7.5, 17 4.5 C 16.5 11.5, 11 16.5, 7.5 17 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 12 L 15 15" />
    <path d="M6 15 L 3 18 L 4 21 L 7 20 L 9 18" />
    <path d="M18 4.5 L 19.5 6" />
  </svg>
);

// Hand-drawn Animated Explosion Shockwave
export const ExplosionVisual: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    className={`pointer-events-none animate-explosion-burst ${className}`}
  >
    <path
      d="M20 3 L23 13 L34 8 L28 18 L38 22 L27 26 L32 37 L21 30 L16 38 L14 28 L3 32 L9 21 L1 15 L12 14 Z"
      fill="#cc3333"
      fillOpacity="0.8"
      stroke="#991f1f"
      strokeWidth="1.5"
    />
    <circle cx="20" cy="20" r="7" fill="#fef08a" />
    <circle cx="20" cy="20" r="4" fill="#ea580c" />
  </svg>
);

// Hand-drawn Water Splash Visual
export const SplashVisual: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 36,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    stroke="#1a3a5f"
    strokeWidth="2"
    strokeLinecap="round"
    className={`pointer-events-none animate-in zoom-in-50 duration-300 ${className}`}
  >
    <circle cx="18" cy="22" r="8" strokeDasharray="3 2" />
    <path d="M18 20 L18 8 M14 20 L10 11 M22 20 L26 11 M7 24 L3 20 M29 24 L33 20" />
    <circle cx="18" cy="6" r="1.5" fill="#1a3a5f" />
    <circle cx="9" cy="9" r="1.2" fill="#1a3a5f" />
    <circle cx="27" cy="9" r="1.2" fill="#1a3a5f" />
  </svg>
);

export const AnchorDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="8" x2="12" y2="21" />
    <path d="M5 12 H 19" />
    <path d="M5 12 C 5 18, 19 18, 19 12" />
  </svg>
);

export const TargetDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="7" />
    <line x1="12" y1="17" x2="12" y2="22" />
    <line x1="2" y1="12" x2="7" y2="12" />
    <line x1="17" y1="12" x2="22" y2="12" />
  </svg>
);

export const ShipSilhouette: React.FC<{
  size: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  isSunk?: boolean;
}> = ({ size, orientation = 'horizontal', className = '', isSunk = false }) => {
  const strokeColor = isSunk ? '#cc3333' : '#1a3a5f';
  const fillColor = isSunk
    ? 'rgba(204, 51, 51, 0.18)'
    : 'rgba(26, 58, 95, 0.16)';

  return (
    <div
      className={`relative flex items-center justify-center ${
        orientation === 'horizontal' ? 'w-full h-full' : 'w-full h-full'
      } ${className}`}
    >
      <svg
        className="w-full h-full"
        viewBox={
          orientation === 'horizontal'
            ? `0 0 ${size * 30} 30`
            : `0 0 30 ${size * 30}`
        }
        fill="none"
        preserveAspectRatio="none"
      >
        {orientation === 'horizontal' ? (
          <>
            <path
              d={`M 4 15 C 8 6, ${size * 30 - 12} 6, ${size * 30 - 4} 15 C ${
                size * 30 - 12
              } 24, 8 24, 4 15 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d={`M 12 15 L ${size * 30 - 16} 15`}
              stroke={strokeColor}
              strokeWidth="1.6"
              strokeDasharray="4 3"
            />
            {size >= 3 && (
              <rect
                x={Math.floor((size * 30) / 2) - 8}
                y="9"
                width="16"
                height="12"
                rx="2"
                stroke={strokeColor}
                strokeWidth="2"
                fill="#fdfaf5"
              />
            )}
            {size >= 4 && (
              <circle
                cx={Math.floor((size * 30) / 4)}
                cy="15"
                r="3"
                stroke={strokeColor}
                strokeWidth="1.6"
              />
            )}
            {size >= 5 && (
              <circle
                cx={Math.floor((size * 30 * 3) / 4)}
                cy="15"
                r="3"
                stroke={strokeColor}
                strokeWidth="1.6"
              />
            )}
          </>
        ) : (
          <>
            <path
              d={`M 15 4 C 6 8, 6 ${size * 30 - 12}, 15 ${
                size * 30 - 4
              } C 24 ${size * 30 - 12}, 24 8, 15 4 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d={`M 15 12 L 15 ${size * 30 - 16}`}
              stroke={strokeColor}
              strokeWidth="1.6"
              strokeDasharray="4 3"
            />
            {size >= 3 && (
              <rect
                x="9"
                y={Math.floor((size * 30) / 2) - 8}
                width="12"
                height="16"
                rx="2"
                stroke={strokeColor}
                strokeWidth="2"
                fill="#fdfaf5"
              />
            )}
          </>
        )}
      </svg>
    </div>
  );
};

export const DoodleStar: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path
      d="M12 2 L 15 8 L 22 9 L 17 14 L 18 21 L 12 17.5 L 6 21 L 7 14 L 2 9 L 9 8 Z"
      fill="rgba(234, 179, 8, 0.25)"
      stroke="#ca8a04"
    />
  </svg>
);

export const DoodleSkull: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="10" r="7" stroke="#cc3333" />
    <circle cx="9.5" cy="9.5" r="1.5" fill="#cc3333" />
    <circle cx="14.5" cy="9.5" r="1.5" fill="#cc3333" />
    <path d="M9 17 L 9 14 L 15 14 L 15 17" stroke="#cc3333" />
    <line x1="12" y1="14" x2="12" y2="17" stroke="#cc3333" />
    <line x1="5" y1="20" x2="19" y2="20" stroke="#cc3333" />
  </svg>
);
