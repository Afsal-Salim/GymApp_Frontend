import type { CSSProperties } from 'react';

export type TextStylePreset = {
  id: string;
  label: string;
  hint: string;
  /** React `CSSProperties` (camelCase). The panel converts these to kebab-case for GrapesJS `setStyle`. */
  style: CSSProperties;
};

export type TextStyleSection = {
  id: string;
  label: string;
  presets: TextStylePreset[];
};

/* ----------------------------------------------------------------------------
 * Tiny preset builders — keep the section data below readable as one-liners.
 *
 *  - `g`   gradient text (background-image clipped to glyph shapes)
 *  - `o`   outlined text (transparent fill + -webkit-text-stroke)
 *  - `n`   neon glow (white fill + layered colored text-shadow)
 *  - `sh`  arbitrary text-shadow over a solid color
 *  - `sol` plain solid color
 * -------------------------------------------------------------------------- */

const g = (image: string, weight: number = 800, extra: CSSProperties = {}): CSSProperties => ({
  backgroundImage: image,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  fontWeight: weight,
  ...extra,
});

const o = (
  width: string,
  color: string,
  weight: number = 800,
  extra: CSSProperties = {},
): CSSProperties => ({
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  WebkitTextStrokeWidth: width,
  WebkitTextStrokeColor: color,
  fontWeight: weight,
  ...extra,
});

const n = (
  inner: string,
  outer: string,
  fillColor: string = '#ffffff',
  weight: number = 700,
): CSSProperties => ({
  color: fillColor,
  textShadow: `0 0 6px ${inner}, 0 0 14px ${inner}, 0 0 28px ${outer}, 0 0 44px ${outer}`,
  fontWeight: weight,
});

const sh = (shadow: string, color: string = '#0f172a', weight: number = 700): CSSProperties => ({
  color,
  textShadow: shadow,
  fontWeight: weight,
});

const sol = (color: string, weight: number = 700): CSSProperties => ({ color, fontWeight: weight });

/* ----------------------------------------------------------------------------
 * Sections shown in the left-column "Text styles" panel, in render order.
 * Total: 115 presets (~100 new + the 15 originals, IDs preserved).
 * -------------------------------------------------------------------------- */

export const TEXT_STYLE_SECTIONS: TextStyleSection[] = [
  {
    id: 'basics',
    label: 'Basics',
    presets: [
      { id: 'solid',          label: 'Solid',         hint: 'Clean solid text',  style: sol('#0f172a', 600) },
      { id: 'solid-slate',    label: 'Slate',         hint: 'Soft slate gray',   style: sol('#475569') },
      { id: 'solid-charcoal', label: 'Charcoal',      hint: 'Deep charcoal',     style: sol('#1e293b') },
      { id: 'solid-navy',     label: 'Navy',          hint: 'Classic navy blue', style: sol('#1e3a8a') },
      { id: 'solid-burgundy', label: 'Burgundy',      hint: 'Rich burgundy',     style: sol('#9f1239') },
      { id: 'solid-emerald',  label: 'Emerald',       hint: 'Emerald green',     style: sol('#047857') },
      { id: 'solid-amber',    label: 'Amber',         hint: 'Warm amber',        style: sol('#b45309') },
      { id: 'solid-pink',     label: 'Hot pink',      hint: 'Hot pink',          style: sol('#db2777') },
      { id: 'solid-electric', label: 'Electric blue', hint: 'Electric blue',     style: sol('#2563eb') },
      { id: 'solid-mint',     label: 'Mint',          hint: 'Fresh mint',        style: sol('#0d9488') },
      { id: 'solid-coral',    label: 'Coral',         hint: 'Coral red',         style: sol('#f43f5e') },
    ],
  },
  {
    id: 'gradients',
    label: 'Gradients',
    presets: [
      { id: 'sunset',         label: 'Sunset',        hint: 'Orange → pink',                 style: g('linear-gradient(90deg, #f97316 0%, #ec4899 100%)') },
      { id: 'ocean',          label: 'Ocean',         hint: 'Cyan → blue',                   style: g('linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)') },
      { id: 'violet',         label: 'Violet',        hint: 'Purple → pink',                 style: g('linear-gradient(135deg, #a855f7 0%, #ec4899 100%)') },
      { id: 'forest',         label: 'Forest',        hint: 'Green → teal',                  style: g('linear-gradient(135deg, #16a34a 0%, #0d9488 100%)') },
      { id: 'sunrise',        label: 'Sunrise',       hint: 'Yellow → orange → red',         style: g('linear-gradient(135deg, #fde047 0%, #f97316 50%, #dc2626 100%)') },
      { id: 'bold-gradient',  label: 'Bold blue',     hint: 'Blue → violet, heavy',          style: g('linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', 900, { letterSpacing: '-0.01em' }) },
      { id: 'twilight',       label: 'Twilight',      hint: 'Indigo → pink → orange',        style: g('linear-gradient(135deg, #312e81 0%, #ec4899 50%, #f97316 100%)') },
      { id: 'aurora',         label: 'Aurora',        hint: 'Green → cyan → purple',         style: g('linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #a855f7 100%)') },
      { id: 'cherry-blossom', label: 'Cherry blossom',hint: 'Pale pink → rose',              style: g('linear-gradient(90deg, #fbcfe8 0%, #fb7185 100%)') },
      { id: 'mango',          label: 'Mango',         hint: 'Pale yellow → orange',          style: g('linear-gradient(135deg, #fef3c7 0%, #f97316 100%)') },
      { id: 'lime',           label: 'Lime',          hint: 'Lime → yellow',                 style: g('linear-gradient(135deg, #84cc16 0%, #fde047 100%)') },
      { id: 'berry',          label: 'Berry',         hint: 'Deep berry → red',              style: g('linear-gradient(135deg, #831843 0%, #ef4444 100%)') },
      { id: 'monochrome',     label: 'Monochrome',    hint: 'Dark → light slate',            style: g('linear-gradient(135deg, #0f172a 0%, #94a3b8 100%)') },
      { id: 'mint-fresh',     label: 'Mint fresh',    hint: 'Mint → teal',                   style: g('linear-gradient(135deg, #6ee7b7 0%, #14b8a6 100%)') },
      { id: 'coral',          label: 'Coral',         hint: 'Coral pink → orange',           style: g('linear-gradient(135deg, #fb7185 0%, #fb923c 100%)') },
      { id: 'sky',            label: 'Sky',           hint: 'Sky → indigo',                  style: g('linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)') },
      { id: 'lavender',       label: 'Lavender',      hint: 'Lavender → pink-violet',        style: g('linear-gradient(135deg, #c4b5fd 0%, #f0abfc 100%)') },
      { id: 'tropical',       label: 'Tropical',      hint: 'Green → yellow → red',          style: g('linear-gradient(135deg, #10b981 0%, #facc15 50%, #ef4444 100%)') },
      { id: 'sea-breeze',     label: 'Sea breeze',    hint: 'Cyan → blue → indigo',          style: g('linear-gradient(135deg, #67e8f9 0%, #38bdf8 50%, #818cf8 100%)') },
      { id: 'cosmic',         label: 'Cosmic',        hint: 'Purple → pink → blue',          style: g('linear-gradient(135deg, #581c87 0%, #ec4899 50%, #38bdf8 100%)') },
      { id: 'fire',           label: 'Fire',          hint: 'Red → orange → yellow',         style: g('linear-gradient(135deg, #b91c1c 0%, #f97316 50%, #fde047 100%)') },
      { id: 'ice',            label: 'Ice',           hint: 'Pale blue → blue',              style: g('linear-gradient(135deg, #e0f2fe 0%, #67e8f9 50%, #38bdf8 100%)') },
      { id: 'peach',          label: 'Peach',         hint: 'Peach → orange',                style: g('linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)') },
      { id: 'blush',          label: 'Blush',         hint: 'Two-tone blush pink',           style: g('linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)') },
      { id: 'royal',          label: 'Royal',         hint: 'Deep royal blue',               style: g('linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%)') },
      { id: 'jungle',         label: 'Jungle',        hint: 'Dark green → lime',             style: g('linear-gradient(135deg, #14532d 0%, #16a34a 50%, #84cc16 100%)') },
      { id: 'pumpkin',        label: 'Pumpkin',       hint: 'Deep → bright orange',          style: g('linear-gradient(135deg, #c2410c 0%, #f97316 50%, #fb923c 100%)') },
      { id: 'bubblegum',      label: 'Bubblegum',     hint: 'Light purple → pink',           style: g('linear-gradient(135deg, #f0abfc 0%, #fb7185 100%)') },
      { id: 'instagram',      label: 'Instagram',     hint: 'Orange → red → purple',         style: g('linear-gradient(45deg, #fcb045 0%, #fd1d1d 50%, #833ab4 100%)') },
      { id: 'spotify',        label: 'Spotify',       hint: 'Spotify green',                 style: g('linear-gradient(135deg, #1db954 0%, #1ed760 100%)') },
      { id: 'discord',        label: 'Discord',       hint: 'Discord blurple',               style: g('linear-gradient(135deg, #5865f2 0%, #7289da 100%)') },
      { id: 'twitter',        label: 'Twitter',       hint: 'Twitter blue',                  style: g('linear-gradient(135deg, #1da1f2 0%, #0d8ddb 100%)') },
    ],
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    presets: [
      { id: 'rainbow',          label: 'Rainbow',         hint: 'Full multi-color rainbow', style: g('linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #a855f7)', 900) },
      { id: 'pastel-rainbow',   label: 'Pastel rainbow',  hint: 'Soft pastel rainbow',      style: g('linear-gradient(90deg, #fda4af, #fdba74, #fde047, #86efac, #67e8f9, #a5b4fc, #d8b4fe)', 800) },
      { id: 'vivid-rainbow',    label: 'Vivid rainbow',   hint: 'Saturated rainbow',        style: g('linear-gradient(90deg, #dc2626, #ea580c, #ca8a04, #16a34a, #0891b2, #4f46e5, #9333ea)', 900) },
      { id: 'pride-flag',       label: 'Pride',           hint: 'Six-stripe pride',         style: g('linear-gradient(90deg, #e40303 0%, #ff8c00 17%, #ffed00 34%, #008026 51%, #004dff 68%, #750787 100%)', 900) },
      { id: 'diagonal-rainbow', label: 'Rainbow diagonal',hint: 'Diagonal rainbow',         style: g('linear-gradient(135deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #a855f7)', 900) },
      { id: 'reverse-rainbow',  label: 'Reverse rainbow', hint: 'Purple → red rainbow',     style: g('linear-gradient(270deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #a855f7)', 900) },
    ],
  },
  {
    id: 'metallic',
    label: 'Metallic',
    presets: [
      { id: 'shimmer-gold', label: 'Gold',       hint: 'Metallic gold',         style: g('linear-gradient(135deg, #b45309 0%, #fde68a 25%, #f59e0b 50%, #fde68a 75%, #b45309 100%)', 800, { backgroundSize: '200% 100%' }) },
      { id: 'silver',       label: 'Silver',     hint: 'Metallic silver',       style: g('linear-gradient(135deg, #64748b 0%, #f1f5f9 25%, #94a3b8 50%, #f1f5f9 75%, #64748b 100%)', 800, { backgroundSize: '200% 100%' }) },
      { id: 'copper',       label: 'Copper',     hint: 'Metallic copper',       style: g('linear-gradient(135deg, #92400e 0%, #f5d6a8 25%, #b87333 50%, #f5d6a8 75%, #92400e 100%)', 800, { backgroundSize: '200% 100%' }) },
      { id: 'rose-gold',    label: 'Rose gold',  hint: 'Metallic rose gold',    style: g('linear-gradient(135deg, #9f1239 0%, #fda4af 25%, #be185d 50%, #fda4af 75%, #9f1239 100%)', 800, { backgroundSize: '200% 100%' }) },
      { id: 'chrome',       label: 'Chrome',     hint: 'Metallic chrome',       style: g('linear-gradient(135deg, #1e293b 0%, #cbd5e1 35%, #f8fafc 50%, #cbd5e1 65%, #1e293b 100%)', 800, { backgroundSize: '200% 100%' }) },
      { id: 'platinum',     label: 'Platinum',   hint: 'Metallic platinum',     style: g('linear-gradient(135deg, #94a3b8 0%, #f1f5f9 50%, #94a3b8 100%)', 800, { backgroundSize: '200% 100%' }) },
      { id: 'bronze',       label: 'Bronze',     hint: 'Metallic bronze',       style: g('linear-gradient(135deg, #78350f 0%, #d97706 50%, #92400e 100%)', 800, { backgroundSize: '200% 100%' }) },
      { id: 'holographic',  label: 'Holographic',hint: 'Pearlescent shimmer',   style: g('linear-gradient(135deg, #f0abfc 0%, #67e8f9 25%, #a7f3d0 50%, #fde68a 75%, #f0abfc 100%)', 800, { backgroundSize: '200% 100%' }) },
    ],
  },
  {
    id: 'neon',
    label: 'Neon glow',
    presets: [
      { id: 'neon',          label: 'Neon cyan',   hint: 'Cyan glow',                 style: n('#38bdf8', '#0ea5e9') },
      { id: 'neon-pink',     label: 'Neon pink',   hint: 'Pink glow',                 style: n('#f472b6', '#ec4899') },
      { id: 'neon-green',    label: 'Neon green',  hint: 'Green glow',                style: n('#4ade80', '#22c55e') },
      { id: 'neon-yellow',   label: 'Neon yellow', hint: 'Yellow glow',               style: n('#fde047', '#facc15') },
      { id: 'neon-orange',   label: 'Neon orange', hint: 'Orange glow',               style: n('#fb923c', '#f97316') },
      { id: 'neon-purple',   label: 'Neon purple', hint: 'Purple glow',               style: n('#c084fc', '#a855f7') },
      { id: 'neon-red',      label: 'Neon red',    hint: 'Red glow',                  style: n('#f87171', '#ef4444') },
      { id: 'neon-blue',     label: 'Neon blue',   hint: 'Blue glow',                 style: n('#60a5fa', '#3b82f6') },
      { id: 'neon-magenta',  label: 'Neon magenta',hint: 'Magenta glow',              style: n('#e879f9', '#d946ef') },
      { id: 'neon-white',    label: 'Neon white',  hint: 'Soft white glow',           style: n('#ffffff', '#e5e7eb', '#ffffff') },
      { id: 'soft-neon',     label: 'Soft neon',   hint: 'Subtle pastel glow',        style: { color: '#ffffff', textShadow: '0 0 4px #67e8f9, 0 0 10px #67e8f9', fontWeight: 600 } },
      { id: 'ultra-neon',    label: 'Ultra neon',  hint: 'Layered intense glow',      style: { color: '#ffffff', textShadow: '0 0 4px #ec4899, 0 0 8px #ec4899, 0 0 16px #d946ef, 0 0 28px #a855f7, 0 0 48px #7c3aed', fontWeight: 800 } },
      { id: 'neon-multi',    label: 'Multi neon',  hint: 'Pink + blue split glow',    style: { color: '#ffffff', textShadow: '-2px 0 6px #ec4899, 2px 0 6px #38bdf8, 0 0 14px rgba(255,255,255,0.6)', fontWeight: 700 } },
    ],
  },
  {
    id: 'outline',
    label: 'Outline',
    presets: [
      { id: 'outline',             label: 'Outline',          hint: 'Dark thick stroke',         style: o('2px', '#0f172a') },
      { id: 'outline-thick-white', label: 'Outline white',    hint: 'Thick white stroke',        style: o('3px', '#ffffff') },
      { id: 'outline-thin',        label: 'Outline thin',     hint: 'Thin dark outline',         style: o('1px', '#0f172a', 700) },
      { id: 'outline-red',         label: 'Outline red',      hint: 'Red outline',               style: o('2px', '#dc2626') },
      { id: 'outline-blue',        label: 'Outline blue',     hint: 'Blue outline',              style: o('2px', '#2563eb') },
      { id: 'outline-shadow',      label: 'Outline + shadow', hint: 'Outline with drop shadow',  style: { ...o('2px', '#0f172a'), textShadow: '0 6px 14px rgba(15,23,42,0.25)' } },
    ],
  },
  {
    id: 'shadow',
    label: 'Shadow',
    presets: [
      { id: 'soft-shadow',       label: 'Soft shadow', hint: 'Subtle drop shadow',         style: sh('0 6px 18px rgba(15, 23, 42, 0.18)') },
      { id: 'hard-shadow-black', label: 'Hard',        hint: 'Crisp offset shadow',        style: sh('4px 4px 0 #0f172a') },
      { id: 'hard-shadow-red',   label: 'Hard red',    hint: 'Red offset shadow',          style: sh('4px 4px 0 #dc2626') },
      { id: 'hard-shadow-blue',  label: 'Hard blue',   hint: 'Blue offset shadow',         style: sh('4px 4px 0 #2563eb') },
      { id: 'long-shadow',       label: 'Long shadow', hint: 'Sun-cast long shadow',       style: sh('1px 1px #0f172a, 2px 2px #0f172a, 3px 3px #0f172a, 4px 4px #0f172a, 5px 5px #0f172a, 6px 6px #0f172a, 7px 7px #0f172a, 8px 8px #0f172a') },
      { id: 'long-shadow-blue',  label: 'Long blue',   hint: 'Long blue shadow',           style: sh('1px 1px #2563eb, 2px 2px #2563eb, 3px 3px #2563eb, 4px 4px #2563eb, 5px 5px #2563eb, 6px 6px #2563eb, 7px 7px #2563eb, 8px 8px #2563eb') },
      { id: 'lifted',            label: 'Lifted',      hint: 'Medium drop shadow',         style: sh('0 8px 22px rgba(15, 23, 42, 0.28)') },
      { id: 'drop-deep',         label: 'Deep drop',   hint: 'Deeper drop shadow',         style: sh('0 14px 28px rgba(15, 23, 42, 0.35)') },
      { id: 'duotone-shadow',    label: 'Duotone',     hint: 'Pink + cyan dual shadow',    style: sh('3px 3px 0 #f472b6, -3px -3px 0 #67e8f9') },
      { id: 'inset-look',        label: 'Inset look',  hint: 'Pressed-in highlight',       style: { color: '#cbd5e1', textShadow: '0 1px 0 #ffffff, 0 -1px 0 #475569', fontWeight: 800 } },
      { id: 'glow-soft',         label: 'Soft glow',   hint: 'Diffuse soft glow',          style: sh('0 0 20px rgba(99, 102, 241, 0.55)') },
      { id: 'ambient-shadow',    label: 'Ambient',     hint: 'Big ambient halo',           style: sh('0 24px 60px rgba(15, 23, 42, 0.45)') },
    ],
  },
  {
    id: 'depth',
    label: '3D & embossed',
    presets: [
      { id: 'pop-3d',         label: '3D pop',     hint: 'Layered grayscale 3D', style: sh('0 1px 0 #d4d4d8, 0 2px 0 #a1a1aa, 0 3px 0 #71717a, 0 4px 0 #52525b, 0 6px 12px rgba(0,0,0,0.35)', '#ffffff', 800) },
      { id: '3d-blue',        label: '3D blue',    hint: '3D blue stacked',      style: sh('0 1px 0 #93c5fd, 0 2px 0 #60a5fa, 0 3px 0 #3b82f6, 0 4px 0 #2563eb, 0 6px 12px rgba(37,99,235,0.4)', '#eff6ff', 800) },
      { id: '3d-red',         label: '3D red',     hint: '3D red stacked',       style: sh('0 1px 0 #fecaca, 0 2px 0 #f87171, 0 3px 0 #ef4444, 0 4px 0 #dc2626, 0 6px 12px rgba(220,38,38,0.4)', '#fef2f2', 800) },
      { id: '3d-green',       label: '3D green',   hint: '3D green stacked',     style: sh('0 1px 0 #bbf7d0, 0 2px 0 #4ade80, 0 3px 0 #22c55e, 0 4px 0 #16a34a, 0 6px 12px rgba(22,163,74,0.4)', '#f0fdf4', 800) },
      { id: 'embossed-light', label: 'Embossed',   hint: 'Light embossed look',  style: { color: '#cbd5e1', textShadow: '-1px -1px 0 #ffffff, 1px 1px 1px rgba(0,0,0,0.3)', fontWeight: 800 } },
      { id: 'embossed-dark',  label: 'Embossed dark', hint: 'Dark embossed look',style: { color: '#1e293b', textShadow: '1px 1px 0 #475569, -1px -1px 0 rgba(0,0,0,0.6)', fontWeight: 800 } },
      { id: 'engraved',       label: 'Engraved',   hint: 'Pressed-in effect',    style: { color: '#475569', textShadow: '0 1px 0 #ffffff, 0 -1px 0 rgba(0,0,0,0.5)', fontWeight: 800 } },
      { id: 'comic-pop',      label: 'Comic',      hint: 'Outline + yellow offset', style: { ...o('2px', '#0f172a'), textShadow: '4px 4px 0 #fde047, 6px 6px 0 #0f172a' } },
      { id: 'retro-stack',    label: 'Retro stack',hint: 'Pink + cyan stacked',  style: { color: '#fde047', textShadow: '2px 2px 0 #ec4899, 4px 4px 0 #38bdf8', fontWeight: 800 } },
    ],
  },
  {
    id: 'glitch',
    label: 'Glitch',
    presets: [
      { id: 'glitch',          label: 'Glitch',          hint: 'Red/cyan split',          style: sh('2px 0 0 #ef4444, -2px 0 0 #06b6d4', '#0f172a', 800) },
      { id: 'chromatic',       label: 'Chromatic',       hint: 'Subtle RGB split',        style: sh('1px 0 0 #ef4444, -1px 0 0 #3b82f6', '#0f172a', 800) },
      { id: 'glitch-heavy',    label: 'Heavy glitch',    hint: 'Wider RGB split',         style: sh('4px 0 0 #ef4444, -4px 0 0 #06b6d4', '#0f172a', 900) },
      { id: 'glitch-vertical', label: 'Vertical glitch', hint: 'Top/bottom split',        style: sh('0 -2px 0 #ef4444, 0 2px 0 #06b6d4', '#0f172a', 800) },
      { id: 'cmyk-glitch',     label: 'CMYK glitch',     hint: 'Cyan + magenta + yellow', style: sh('-2px 0 0 #06b6d4, 2px 0 0 #ec4899, 0 -2px 0 #facc15', '#0f172a', 800) },
    ],
  },
  {
    id: 'themed',
    label: 'Themed',
    presets: [
      { id: 'candy',      label: 'Candy',      hint: 'Pastel pink/violet/cyan',     style: g('linear-gradient(135deg, #f472b6 0%, #c4b5fd 50%, #67e8f9 100%)') },
      { id: 'vaporwave',  label: 'Vaporwave',  hint: 'Pink + cyan retro',           style: g('linear-gradient(135deg, #ec4899 0%, #67e8f9 100%)', 800, { textShadow: '0 0 12px rgba(236,72,153,0.4), 0 0 24px rgba(103,232,249,0.3)' }) },
      { id: 'synthwave',  label: 'Synthwave',  hint: 'Hot pink + violet glow',      style: { color: '#f472b6', textShadow: '0 0 6px #ec4899, 0 0 16px #d946ef, 0 0 32px #7c3aed', fontWeight: 800 } },
      { id: 'matrix',     label: 'Matrix',     hint: 'Hacker green mono',           style: { color: '#22c55e', textShadow: '0 0 6px #16a34a, 0 0 18px #15803d', fontWeight: 700, fontFamily: 'monospace' } },
      { id: 'cyberpunk',  label: 'Cyberpunk',  hint: 'Yellow on cyan glow',         style: { color: '#fde047', textShadow: '0 0 6px #06b6d4, 0 0 18px #0891b2, 2px 0 0 #ec4899', fontWeight: 800 } },
      { id: 'retro-80s',  label: 'Retro 80s',  hint: 'Yellow → orange → pink',      style: g('linear-gradient(180deg, #fde047 0%, #fb923c 50%, #ec4899 100%)', 900) },
      { id: 'watercolor', label: 'Watercolor', hint: 'Soft pastel watercolor',      style: g('linear-gradient(135deg, #fda4af 0%, #fcd34d 33%, #86efac 66%, #93c5fd 100%)', 700) },
      { id: 'frost',      label: 'Frost',      hint: 'Icy white with cyan glow',    style: { color: '#f0f9ff', textShadow: '0 0 8px #67e8f9, 0 0 18px #38bdf8, 0 2px 6px rgba(56,189,248,0.4)', fontWeight: 800 } },
      { id: 'lava',       label: 'Lava',       hint: 'Red gradient with orange aura', style: { ...g('linear-gradient(135deg, #fde047 0%, #f97316 50%, #dc2626 100%)', 900), filter: 'drop-shadow(0 0 6px #f97316)' } },
      { id: 'arcade',     label: 'Arcade',     hint: 'Pixel-y retro arcade',        style: { color: '#fde047', textShadow: '2px 0 0 #ef4444, 0 2px 0 #38bdf8, 2px 2px 0 #16a34a', fontWeight: 900, fontFamily: 'monospace' } },
      { id: 'dreamy',     label: 'Dreamy',     hint: 'Pastel violet/pink',          style: g('linear-gradient(135deg, #ddd6fe 0%, #fbcfe8 50%, #fed7aa 100%)', 700) },
      { id: 'western',    label: 'Western',    hint: 'Sandy brown gradient',        style: g('linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)') },
      { id: 'autumn',     label: 'Autumn',     hint: 'Red → orange → mustard',      style: g('linear-gradient(135deg, #991b1b 0%, #ea580c 50%, #ca8a04 100%)') },
    ],
  },
];
