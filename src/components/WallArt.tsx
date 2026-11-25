"use client";
import { useId } from "react";
import type { ArtVariant } from "@/lib/catalog";

/** Illustrated room scenes used for before/after cards, provider galleries and panel swatches. */
export function WallArt({ variant, before = false, className = "" }: { variant: ArtVariant | string; before?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const W = 400, H = 260, FLOOR = 205;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-full w-full ${className}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={before ? "Before" : `After: ${variant}`}>
      <defs>
        <linearGradient id={`fl${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c8a27a" />
          <stop offset="1" stopColor="#9c7653" />
        </linearGradient>
        <pattern id={`flute${id}`} width="14" height="10" patternUnits="userSpaceOnUse">
          <rect width="14" height="10" fill="#d9b48a" />
          <rect width="7" height="10" fill="#c49a6c" />
          <rect x="6" width="2" height="10" fill="#a87f55" />
        </pattern>
        <pattern id={`char${id}`} width="18" height="10" patternUnits="userSpaceOnUse">
          <rect width="18" height="10" fill="#2b2f36" />
          <rect width="10" height="10" fill="#3a3f48" />
        </pattern>
        <pattern id={`wood${id}`} width="60" height="12" patternUnits="userSpaceOnUse">
          <rect width="60" height="12" fill="#b88b5e" />
          <path d="M0 4 Q15 2 30 5 T60 4" stroke="#9e7246" strokeWidth="1" fill="none" />
          <path d="M0 9 Q20 7 40 10 T60 9" stroke="#a77a4d" strokeWidth=".8" fill="none" />
        </pattern>
        <pattern id={`tex${id}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#6b8f9e" />
          <path d="M0 12 Q6 4 12 12 T24 12" stroke="#7fa3b1" strokeWidth="3" fill="none" />
          <path d="M0 24 Q6 16 12 24 T24 24" stroke="#5c7f8e" strokeWidth="2" fill="none" />
        </pattern>
        <pattern id={`sten${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#f3e6d3" />
          <path d="M20 4 L26 20 L20 36 L14 20 Z" fill="#c07a4d" opacity=".55" />
          <circle cx="0" cy="0" r="5" fill="#c07a4d" opacity=".4" />
          <circle cx="40" cy="40" r="5" fill="#c07a4d" opacity=".4" />
        </pattern>
        <pattern id={`jali${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#f6e7c8" />
          <circle cx="10" cy="10" r="7" fill="none" stroke="#c99a4b" strokeWidth="2" />
        </pattern>
        <pattern id={`tile${id}`} width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#e8eef2" />
          <path d="M0 0 H30 V30" fill="none" stroke="#c9d4dc" strokeWidth="1.5" />
        </pattern>
        <radialGradient id={`glow${id}`} cx=".5" cy="0" r="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff6d6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {before ? <BeforeScene id={id} W={W} FLOOR={FLOOR} variant={variant} /> : <AfterScene id={id} W={W} FLOOR={FLOOR} variant={variant} />}
      {/* floor */}
      <rect y={FLOOR} width={W} height={H - FLOOR} fill={before ? "#9aa0a6" : `url(#fl${id})`} />
      <rect y={FLOOR} width={W} height="4" fill={before ? "#80868c" : "#7a5a3c"} />
    </svg>
  );
}

function BeforeScene({ id, W, FLOOR, variant }: { id: string; W: number; FLOOR: number; variant: string }) {
  const wet = variant === "bathroom" || variant === "kitchen";
  return (
    <g>
      <rect width={W} height={FLOOR} fill={wet ? `url(#tile${id})` : "#d8d2c4"} />
      {/* damp patches & cracks */}
      <ellipse cx="300" cy="40" rx="60" ry="22" fill="#b9b19d" opacity=".7" />
      <ellipse cx="80" cy="160" rx="40" ry="18" fill="#c3bba7" opacity=".7" />
      <path d="M210 0 L215 30 L205 55 L218 90" stroke="#9c9583" strokeWidth="2" fill="none" />
      <path d="M60 60 L70 80 L64 100" stroke="#a49c89" strokeWidth="1.5" fill="none" />
      {/* bare bulb */}
      <line x1="200" y1="0" x2="200" y2="30" stroke="#555" strokeWidth="2" />
      <circle cx="200" cy="36" r="7" fill="#f3efe0" stroke="#999" />
      {/* old furniture */}
      {variant === "kitchen" ? (
        <rect x="40" y="140" width="320" height="65" fill="#a39a8c" />
      ) : variant === "bathroom" ? (
        <g>
          <rect x="150" y="150" width="100" height="55" fill="#e5e5e5" stroke="#bbb" />
          <rect x="170" y="70" width="60" height="50" fill="#cfd8dc" stroke="#aaa" />
        </g>
      ) : (
        <g>
          <rect x="120" y="160" width="160" height="45" rx="6" fill="#8d8478" />
          <rect x="130" y="145" width="140" height="20" rx="6" fill="#9b9286" />
        </g>
      )}
      <text x="12" y="22" fontSize="13" fontWeight="700" fill="#5f5a4f" fontFamily="sans-serif">BEFORE</text>
    </g>
  );
}

function AfterScene({ id, W, FLOOR, variant }: { id: string; W: number; FLOOR: number; variant: string }) {
  const sofa = (
    <g>
      <rect x="110" y="158" width="180" height="47" rx="10" fill="#2f4858" />
      <rect x="120" y="140" width="160" height="26" rx="10" fill="#3d5a6c" />
      <rect x="150" y="150" width="28" height="16" rx="4" fill="#f59e0b" />
      <rect x="222" y="150" width="28" height="16" rx="4" fill="#e9d8a6" />
    </g>
  );
  const plant = (x: number) => (
    <g>
      <rect x={x} y="175" width="22" height="30" rx="3" fill="#e0e0e0" />
      <ellipse cx={x + 11} cy="160" rx="18" ry="22" fill="#3f8f5a" />
      <ellipse cx={x + 4} cy="150" rx="8" ry="14" fill="#4fa36a" />
    </g>
  );
  const tvUnit = (
    <g>
      <rect x="120" y="60" width="160" height="90" rx="4" fill="#111827" />
      <rect x="124" y="64" width="152" height="82" fill="#1f2937" />
      <rect x="80" y="170" width="240" height="35" fill="#f1e4cf" />
      <rect x="80" y="170" width="240" height="4" fill="#d9c4a3" />
      <line x1="160" y1="174" x2="160" y2="205" stroke="#d9c4a3" />
      <line x1="240" y1="174" x2="240" y2="205" stroke="#d9c4a3" />
    </g>
  );
  let wall: React.ReactNode;
  let decor: React.ReactNode = sofa;
  switch (variant) {
    case "fluted":
      wall = (
        <g>
          <rect width={W} height={FLOOR} fill="#efe7da" />
          <rect x="70" width="260" height={FLOOR} fill={`url(#flute${id})`} />
          <rect x="68" width="3" height={FLOOR} fill="#fbbf24" opacity=".8" />
          <rect x="329" width="3" height={FLOOR} fill="#fbbf24" opacity=".8" />
        </g>
      );
      decor = <>{sofa}{plant(340)}</>;
      break;
    case "charcoal":
      wall = (
        <g>
          <rect width={W} height={FLOOR} fill="#e9e6e1" />
          <rect x="60" width="280" height={FLOOR} fill={`url(#char${id})`} />
        </g>
      );
      decor = tvUnit;
      break;
    case "wpc":
      wall = (
        <g>
          <rect width={W} height={FLOOR} fill={`url(#wood${id})`} />
          {[80, 160, 240, 320].map((x) => <rect key={x} x={x} width="2" height={FLOOR} fill="#8a6440" />)}
        </g>
      );
      decor = (
        <g>
          <rect x="90" y="150" width="220" height="55" rx="6" fill="#f5f5f4" />
          <rect x="90" y="120" width="220" height="38" rx="8" fill="#57534e" />
          <rect x="110" y="138" width="60" height="18" rx="6" fill="#fafaf9" />
          <rect x="230" y="138" width="60" height="18" rx="6" fill="#fafaf9" />
        </g>
      );
      break;
    case "texture":
      wall = <rect width={W} height={FLOOR} fill={`url(#tex${id})`} />;
      decor = <>{sofa}{plant(40)}</>;
      break;
    case "stencil":
      wall = <rect width={W} height={FLOOR} fill={`url(#sten${id})`} />;
      decor = (
        <g>
          <rect x="110" y="150" width="180" height="10" fill="#6b4226" />
          <rect x="120" y="160" width="8" height="45" fill="#6b4226" />
          <rect x="272" y="160" width="8" height="45" fill="#6b4226" />
          <circle cx="200" cy="140" r="10" fill="#f59e0b" />
        </g>
      );
      break;
    case "mandir":
      wall = (
        <g>
          <rect width={W} height={FLOOR} fill="#fbf3e4" />
          <rect x="120" y="20" width="160" height="185" fill={`url(#jali${id})`} />
          <path d="M120 20 Q200 -10 280 20" fill="#c99a4b" />
        </g>
      );
      decor = (
        <g>
          <rect x="140" y="150" width="120" height="55" fill="#8b5a2b" />
          <circle cx="200" cy="120" r="14" fill="#f59e0b" />
          <rect x="196" y="134" width="8" height="16" fill="#b45309" />
        </g>
      );
      break;
    case "ceiling":
      wall = (
        <g>
          <rect width={W} height={FLOOR} fill="#f4f1ea" />
          <rect width={W} height="34" fill="#fff" />
          <rect x="40" y="34" width="320" height="6" fill="#fde68a" />
          <rect width={W} height="120" fill={`url(#glow${id})`} />
          {[90, 200, 310].map((x) => <circle key={x} cx={x} cy="18" r="5" fill="#fef3c7" stroke="#fbbf24" />)}
        </g>
      );
      decor = <>{sofa}{plant(40)}</>;
      break;
    case "tv-unit":
      wall = (
        <g>
          <rect width={W} height={FLOOR} fill="#ece6dc" />
          <rect x="90" y="30" width="220" height="140" fill="#d6c2a5" />
          <rect x="60" y="30" width="30" height="175" fill="#7c5a3a" />
          <rect x="310" y="30" width="30" height="175" fill="#7c5a3a" />
        </g>
      );
      decor = tvUnit;
      break;
    case "wardrobe":
      wall = <rect width={W} height={FLOOR} fill="#eef0f3" />;
      decor = (
        <g>
          <rect x="60" y="20" width="280" height="185" fill="#d4c4ae" />
          <rect x="60" y="20" width="140" height="185" fill="#c9b79e" />
          <rect x="196" y="20" width="8" height="185" fill="#8b7355" />
          <rect x="182" y="100" width="4" height="30" fill="#4b5563" />
          <rect x="214" y="100" width="4" height="30" fill="#4b5563" />
          <rect x="260" y="20" width="80" height="185" fill="#9fb4c7" opacity=".45" />
        </g>
      );
      break;
    case "kitchen":
      wall = <rect width={W} height={FLOOR} fill={`url(#tile${id})`} />;
      decor = (
        <g>
          <rect x="40" y="30" width="320" height="50" fill="#1e3a5f" />
          {[40, 120, 200, 280].map((x) => <rect key={x} x={x + 4} y="34" width="72" height="42" fill="#264b77" />)}
          <rect x="40" y="140" width="320" height="65" fill="#1e3a5f" />
          <rect x="36" y="136" width="328" height="8" fill="#f5f5f4" />
        </g>
      );
      break;
    case "bathroom":
      wall = <rect width={W} height={FLOOR} fill="#e8f0ef" />;
      decor = (
        <g>
          <rect x="140" y="140" width="120" height="65" fill="#7c5a3a" />
          <rect x="136" y="134" width="128" height="10" fill="#f5f5f4" />
          <ellipse cx="200" cy="137" rx="28" ry="5" fill="#e5e7eb" />
          <rect x="160" y="40" width="80" height="80" rx="6" fill="#cfe3e8" stroke="#7c5a3a" strokeWidth="4" />
        </g>
      );
      break;
    default: // paint
      wall = (
        <g>
          <rect width={W} height={FLOOR} fill="#f1ede6" />
          <rect x="0" width="150" height={FLOOR} fill="#2f6f73" />
        </g>
      );
      decor = <>{sofa}{plant(330)}</>;
  }
  return (
    <g>
      {wall}
      {decor}
      <text x="12" y="22" fontSize="13" fontWeight="700" fill="#fff" stroke="#0006" strokeWidth=".5" fontFamily="sans-serif" paintOrder="stroke">AFTER</text>
    </g>
  );
}

export function PanelSwatch({ pattern, color, className = "" }: { pattern: string; color: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const base = { Brown: "#a5754a", White: "#f3f4f6", Grey: "#9ca3af", Black: "#2b2f36", Beige: "#e2cfb2" }[color] ?? "#ddd";
  const dark = { Brown: "#7c5534", White: "#d1d5db", Grey: "#6b7280", Black: "#1a1d22", Beige: "#c7ad87" }[color] ?? "#bbb";
  let fill: React.ReactNode;
  switch (pattern) {
    case "fluted":
    case "charcoal":
      fill = (<pattern id={id} width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill={base} /><rect width="8" height="10" fill={dark} /></pattern>);
      break;
    case "floral":
      fill = (<pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill={base} />{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="15" cy="9" rx="3" ry="6" fill={dark} transform={`rotate(${a} 15 15)`} />)}<circle cx="15" cy="15" r="2.5" fill="#fff" /></pattern>);
      break;
    case "stone":
      fill = (<pattern id={id} width="40" height="24" patternUnits="userSpaceOnUse"><rect width="40" height="24" fill={base} /><rect x="1" y="1" width="22" height="10" rx="2" fill={dark} opacity=".5" /><rect x="25" y="1" width="14" height="10" rx="2" fill={dark} opacity=".35" /><rect x="1" y="13" width="12" height="10" rx="2" fill={dark} opacity=".4" /><rect x="15" y="13" width="24" height="10" rx="2" fill={dark} opacity=".55" /></pattern>);
      break;
    case "geometric":
      fill = (<pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill={base} /><path d="M12 0 L24 12 L12 24 L0 12 Z" fill="none" stroke={dark} strokeWidth="1.5" /></pattern>);
      break;
    case "ceramic":
      fill = (<pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill={base} /><path d="M0 0H20V20" fill="none" stroke={dark} /></pattern>);
      break;
    case "marble":
      fill = (<pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill={base} /><path d="M0 20 Q20 10 40 30 T80 25" stroke="#9ca3af" fill="none" /><path d="M0 60 Q30 50 50 70 T80 65" stroke="#cbd5e1" fill="none" /></pattern>);
      break;
    default:
      fill = (<pattern id={id} width="60" height="12" patternUnits="userSpaceOnUse"><rect width="60" height="12" fill={base} /><path d="M0 5 Q15 2 30 6 T60 5" stroke={dark} fill="none" /></pattern>);
  }
  return (
    <svg viewBox="0 0 120 120" className={`block h-full w-full ${className}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>{fill}</defs>
      <rect width="120" height="120" fill={`url(#${id})`} />
    </svg>
  );
}
