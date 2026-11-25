import fs from 'fs';
import path from 'path';

const INK = '#2d1b3d';

function Sparkle({ x, y, s = 1, fill = '#fff' }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -10 Q2 -2 10 0 Q2 2 0 10 Q-2 2 -10 0 Q-2 -2 0 -10Z"
      fill={fill}
    />
  );
}

function Kid({ x, y, s, shirt, pants, hair, style, skin = '#ffd2b0', wave = 'right' }) {
  const armUp = wave === 'right' ? 'M72 96 Q94 88 91 62' : 'M28 96 Q6 88 9 62';
  const armDown = wave === 'right' ? 'M28 96 Q10 112 14 134' : 'M72 96 Q90 112 86 134';
  const handUp = wave === 'right' ? [91, 60] : [9, 60];
  const handDown = wave === 'right' ? [14, 136] : [86, 136];

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
      {/* kaki & sepatu */}
      <rect x="32" y="146" width="13" height="42" rx="6" fill={skin} />
      <rect x="55" y="146" width="13" height="42" rx="6" fill={skin} />
      <ellipse cx="36" cy="192" rx="15" ry="8" fill="#fff" stroke="#e6d6f5" strokeWidth="1.5" />
      <ellipse cx="64" cy="192" rx="15" ry="8" fill="#fff" stroke="#e6d6f5" strokeWidth="1.5" />
      {/* celana */}
      <rect x="26" y="128" width="48" height="22" rx="8" fill={pants} />
      <rect x="29" y="140" width="18" height="20" rx="6" fill={pants} />
      <rect x="53" y="140" width="18" height="20" rx="6" fill={pants} />
      {/* lengan */}
      <path d={armDown} stroke={skin} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx={handDown[0]} cy={handDown[1]} r="6.5" fill={skin} />
      <path d={armUp} stroke={skin} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx={handUp[0]} cy={handUp[1]} r="6.5" fill={skin} />
      {/* badan */}
      <rect x="24" y="84" width="52" height="58" rx="18" fill={shirt} />
      <circle cx="28" cy="96" r="10" fill={shirt} />
      <circle cx="72" cy="96" r="10" fill={shirt} />
      {/* rambut belakang */}
      {style === 'bob' && (
        <path d="M16 60 Q14 18 50 18 Q86 18 84 60 L85 84 Q85 92 76 92 L24 92 Q15 92 15 84Z" fill={hair} />
      )}
      {style === 'pigtails' && (
        <>
          <circle cx="14" cy="64" r="13" fill={hair} />
          <circle cx="86" cy="64" r="13" fill={hair} />
          <circle cx="20" cy="46" r="6" fill="#ff5fb0" />
          <circle cx="80" cy="46" r="6" fill="#ff5fb0" />
        </>
      )}
      {style === 'bun' && <circle cx="50" cy="14" r="14" fill={hair} />}
      {style === 'spiky' && <path d="M17 58 Q16 22 50 20 Q84 22 83 58Z" fill={hair} />}
      {/* kepala */}
      <circle cx="50" cy="56" r="31" fill={skin} />
      {/* poni */}
      {style !== 'spiky' && (
        <path d="M19 54 Q22 24 50 24 Q78 24 81 54 Q66 40 50 42 Q34 40 19 54Z" fill={hair} />
      )}
      {style === 'spiky' && (
        <path d="M19 54 L22 28 L34 40 L42 20 L52 38 L62 22 L68 40 L80 28 L81 54 Q66 42 50 44 Q34 42 19 54Z" fill={hair} />
      )}
      {/* wajah */}
      <ellipse cx="38" cy="60" rx="4" ry="5.5" fill={INK} />
      <ellipse cx="62" cy="60" rx="4" ry="5.5" fill={INK} />
      <circle cx="39.5" cy="58" r="1.6" fill="#fff" />
      <circle cx="63.5" cy="58" r="1.6" fill="#fff" />
      <circle cx="30" cy="70" r="5" fill="#ff9fb5" opacity="0.65" />
      <circle cx="70" cy="70" r="5" fill="#ff9fb5" opacity="0.65" />
      <path d="M41 71 Q50 85 59 71Z" fill="#c2415d" />
    </g>
  );
}

export default function HeroKids() {
  const custom = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'hero-kids.png'));
  if (custom) {
    return <img src="/images/hero-kids.png" alt="Anak-anak belajar bersama BELLAJAR" className="mx-auto w-full max-w-lg hover:scale-110 transition-transform" />;
  }

  return (
    <svg viewBox="0 0 470 232" role="img" aria-label="Empat anak yang ceria melambaikan tangan" className="mx-auto block w-full max-w-lg">
      <defs>
        <filter id="sticker" x="-15%" y="-10%" width="130%" height="125%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="grow" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="grow" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <Kid x={6} y={22} s={1} shirt="#ff6fa8" pants="#9b6bf2" hair="#4a2c1d" style="pigtails" wave="right" />
      <Kid x={118} y={32} s={0.93} shirt="#2aa8ff" pants="#3a4a9a" hair="#2d1b14" style="spiky" wave="right" />
      <Kid x={232} y={48} s={0.82} shirt="#ffc61a" pants="#a15cf5" hair="#7a4a2a" style="bun" wave="left" skin="#f6c29a" />
      <Kid x={346} y={14} s={1.03} shirt="#1fb5a3" pants="#2a6f9a" hair="#4a2c1d" style="bob" wave="right" />
      <Sparkle x={104} y={30} s={0.9} />
      <Sparkle x={226} y={40} s={0.7} fill="#ffe27a" />
      <Sparkle x={336} y={44} s={0.8} />
      <Sparkle x={458} y={92} s={0.7} fill="#ffe27a" />
    </svg>
  );
}
