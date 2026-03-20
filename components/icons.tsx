import React from 'react';

export const History: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export const Trash2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

export const Download: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export const AssistantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <radialGradient id="headGradient" cx="50%" cy="20%" r="80%" fx="50%" fy="20%">
        <stop offset="0%" style={{ stopColor: '#82d8ff' }} />
        <stop offset="100%" style={{ stopColor: '#4ab2e6' }} />
      </radialGradient>
       <filter id="drop-shadow-bubble" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
        <feOffset dx="0.5" dy="1" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.4"/>
        </feComponentTransfer>
        <feMerge> 
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/> 
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="50" fill="white" />
    <g transform="scale(1.1) translate(-5, -2)">
      <ellipse cx="50" cy="88" rx="20" ry="4" fill="#000" opacity="0.1" />
      <path d="M 35 60 C 35 45, 65 45, 65 60 Q 65 85, 50 85 Q 35 85, 35 60 Z" fill="#1e5db2" />
      <circle cx="50" cy="70" r="8" fill="#e6332a" />
      <polygon points="50,64 52.35,68.9 57.5,69.55 53.53,73.2 54.7,78.5 50,75.8 45.3,78.5 46.47,73.2 42.5,69.55 47.65,68.9" fill="#ffd500" />
      <ellipse cx="50" cy="43" rx="23" ry="22" fill="url(#headGradient)" />
      <path d="M 36 43 Q 50 35, 64 43 A 20 20 0 0 1 64 48 Q 50 55, 36 48 A 20 20 0 0 1 36 43 Z" fill="#000" opacity="0.1" />
      <circle cx="43" cy="45" r="3.5" fill="black" />
      <circle cx="57" cy="45" r="3.5" fill="black" />
      <circle cx="44.5" cy="43.5" r="1.2" fill="white" opacity="0.9" />
      <circle cx="58.5" cy="43.5" r="1.2" fill="white" opacity="0.9" />
      <path d="M 46 52 Q 50 55, 54 52" stroke="black" strokeWidth="1" fill="none" strokeLinecap="round" />
      <line x1="50" y1="21" x2="50" y2="15" stroke="#4ab2e6" strokeWidth="2.5" />
      <circle cx="50" cy="14" r="3" fill="#4ab2e6" />
      <ellipse cx="30" cy="58" rx="5" ry="10" fill="#4ab2e6" transform="rotate(-20 30 58)" />
      <ellipse cx="70" cy="58" rx="5" ry="10" fill="#4ab2e6" transform="rotate(20 70 58)" />
      <g filter="url(#drop-shadow-bubble)">
        <path d="M 69 22 C 67,22 66,23 66,25 V 35 C 66,37 67,38 69,38 H 70 L 66 43 V 39 H 85 C 87,39 88,38 88,36 V 26 C 88,24 87,23 85,23 H 69 Z" fill="#d1e8f3" transform="rotate(-10 77 32)"/>
        <circle cx="73" cy="30.5" r="1.5" fill="#a4c4d4" transform="rotate(-10 77 32)" />
        <circle cx="79" cy="30.5" r="1.5" fill="#a4c4d4" transform="rotate(-10 77 32)" />
        <circle cx="85" cy="30.5" r="1.5" fill="#a4c4d4" transform="rotate(-10 77 32)" />
      </g>
    </g>
  </svg>
);


export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const FontSizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12h3" />
    <path d="M4 7h2" />
    <path d="M5 17h2" />
    <path d="M10 5h9" />
    <path d="M10 19h9" />
    <path d="M14.5 5v14" />
  </svg>
);

export const Upload: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const CheckCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const Lightbulb: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-7 7c0 3.03 1.13 4.28 2.5 5.5s2.5 1.5 2.5 2.5V18" />
    <path d="M12 2a7 7 0 0 1 7 7c0 3.03-1.13 4.28-2.5 5.5s-2.5 1.5-2.5 2.5V18" />
  </svg>
);

export const XCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const Mail: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const Zalo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#0068ff" d="M24,44C12.954,44,4,35.046,4,24S12.954,4,24,4s20,8.954,20,20S35.046,44,24,44z"></path>
        <path fill="#fff" d="M33.444,25.419c-1.325-0.021-2.58-0.347-3.72-0.896c-0.622-0.299-1.375-0.13-1.815,0.42l-1.34,1.673c-2.315-1.189-4.271-2.91-6.076-5.22l1.623-1.424c0.54-0.474,0.739-1.229,0.47-1.895c-0.54-1.35-0.875-2.8-0.896-4.298c-0.021-1.57-1.31-2.839-2.88-2.818l-4.529,0.063c-1.459,0.021-2.678,1.218-2.636,2.678c0.063,2.441,0.563,4.819,1.449,7.039c1.948,4.88,5.22,8.878,9.74,11.838c2.818,1.835,5.922,2.839,9.11,2.901c0.23,0,0.441,0.021,0.672,0.021c1.459,0,2.657-1.178,2.699-2.636l0.042-4.088C36.326,26.709,35.038,25.419,33.444,25.419z"></path>
    </svg>
);


export const RefreshCw: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const Users: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M23 11h-6" />
  </svg>
);

export const LoadingSpinner: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`animate-spin ${props.className || ''}`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const User: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Bot: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);