import React from 'react';

interface ThaiOrnamentProps {
  variant?: 'light' | 'dark';
  className?: string;
}

/**
 * Refined Thai academic Kanok-inspired gold divider line
 */
export const ThaiOrnament: React.FC<ThaiOrnamentProps> = ({
  variant = 'light',
  className = '',
}) => {
  const strokeMain = variant === 'dark' ? '#F4E4B5' : '#D6AF55';
  const strokeAccent = variant === 'dark' ? '#D6AF55' : '#7043A6';

  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <svg
        width="180"
        height="18"
        viewBox="0 0 180 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-36 sm:w-44 h-auto"
      >
        <line x1="4" y1="9" x2="66" y2="9" stroke={strokeMain} strokeWidth="1.2" strokeOpacity="0.65" />
        <line x1="114" y1="9" x2="176" y2="9" stroke={strokeMain} strokeWidth="1.2" strokeOpacity="0.65" />
        <path
          d="M72 9C76 5 81 5 84 9C81 13 76 13 72 9Z"
          stroke={strokeMain}
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M108 9C104 5 99 5 96 9C99 13 104 13 108 9Z"
          stroke={strokeMain}
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M90 2.5L95.5 9L90 15.5L84.5 9L90 2.5Z"
          fill={strokeMain}
          stroke={strokeAccent}
          strokeWidth="1"
        />
        <circle cx="4" cy="9" r="1.5" fill={strokeMain} fillOpacity="0.8" />
        <circle cx="176" cy="9" r="1.5" fill={strokeMain} fillOpacity="0.8" />
      </svg>
    </div>
  );
};
