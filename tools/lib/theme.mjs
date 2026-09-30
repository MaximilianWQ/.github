// Token contract — aesthetic: LIQUID GLASS (see below).
// Dark is the primary mode; the light mode is frosted glass over a pastel
// aurora on the same hue axes, not an inversion.
//
// Values are authored in OKLCH and emitted as hex. SVG rendered inside an <img>
// has no CSS custom-property cascade to rely on and no @supports fallback path,
// so the conversion happens here at build time and the SVG receives literal
// colours. The OKLCH source values stay in the comments as the real contract.
//
// Never pure #000 for the canvas; neutrals keep a small blue chroma so they do
// not read as dead grey.

/** OKLCH → sRGB hex. Standard OKLab matrices, gamut-clipped per channel. */
export function oklch(l, c, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ * l_ * l_;
  const M = m_ * m_ * m_;
  const S = s_ * s_ * s_;

  const rLin = 4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const gLin = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const bLin = -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S;

  const encode = (v) => {
    const clamped = Math.max(0, Math.min(1, v));
    const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, srgb)) * 255)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${encode(rLin)}${encode(gLin)}${encode(bLin)}`;
}

// Aesthetic: LIQUID GLASS.
// A deep ink canvas lit from behind by a soft aurora (ice cyan → electric blue
// → violet). Every surface is a translucent glass slab: a faint white body, a
// specular rim that is bright on top and fades down, and a hairline highlight
// along the upper edge. Accents are cool and luminous — no warm notes.
const H_INK = 262;
const H_ICE = 212;
const H_BLUE = 255;
const H_VIOLET = 295;

export const DARK = {
  name: "dark",

  bg: oklch(0.155, 0.022, H_INK),
  surface1: oklch(0.205, 0.028, H_INK),
  surface2: oklch(0.245, 0.032, H_INK),
  surface3: oklch(0.3, 0.036, H_INK),

  text: oklch(0.965, 0.008, H_BLUE),
  text2: oklch(0.87, 0.02, H_BLUE),
  text3: oklch(0.72, 0.025, H_BLUE),
  text4: oklch(0.54, 0.03, H_BLUE),

  accent: oklch(0.86, 0.12, H_ICE),
  accentDim: oklch(0.64, 0.19, H_BLUE),
  accent3: oklch(0.66, 0.2, H_VIOLET),
  onAccent: oklch(0.2, 0.03, H_INK),

  line: "#ffffff",
  lineOpacity: 0.12,
  lineSoftOpacity: 0.07,
  liftOpacity: 0.1,

  // Aurora blobs behind the glass: [colour, opacity].
  aurora: [
    [oklch(0.72, 0.15, H_ICE), 0.28],
    [oklch(0.58, 0.22, H_BLUE), 0.3],
    [oklch(0.58, 0.22, H_VIOLET), 0.24],
  ],
  // Glass body (top → bottom alpha of white) and specular rim.
  glass: [0.085, 0.025],
  rim: [0.42, 0.08],
  specular: 0.75,

  // Polished chrome with a faint iridescent cast.
  metal: ["#8fa3c7", "#dce8ff", "#ffffff", "#b3d4ff", "#8e9dff", "#e6dcff", "#a9bde0"],
  sheen: "#ffffff",
  sheenOpacity: 0.6,

  ok: oklch(0.8, 0.14, 170),
  grid: "#ffffff",
  gridOpacity: 0.06,
};

export const LIGHT = {
  name: "light",

  bg: oklch(0.972, 0.008, H_BLUE),
  surface1: oklch(0.99, 0.004, H_BLUE),
  surface2: oklch(0.94, 0.012, H_BLUE),
  surface3: oklch(0.9, 0.018, H_BLUE),

  text: oklch(0.22, 0.03, H_INK),
  text2: oklch(0.36, 0.03, H_INK),
  text3: oklch(0.5, 0.03, H_INK),
  text4: oklch(0.63, 0.025, H_INK),

  accent: oklch(0.56, 0.19, H_BLUE),
  accentDim: oklch(0.66, 0.14, H_ICE),
  accent3: oklch(0.58, 0.2, H_VIOLET),
  onAccent: oklch(0.98, 0.01, H_BLUE),

  line: "#0a1024",
  lineOpacity: 0.1,
  lineSoftOpacity: 0.06,
  liftOpacity: 0.05,

  aurora: [
    [oklch(0.82, 0.11, H_ICE), 0.55],
    [oklch(0.74, 0.14, H_BLUE), 0.4],
    [oklch(0.78, 0.13, H_VIOLET), 0.35],
  ],
  glass: [0.75, 0.42],
  rim: [1, 0.35],
  specular: 1,

  // Deep blue-black chrome: bright metal would vanish on the light canvas.
  metal: ["#3d4f78", "#121a2e", "#0a0f1e", "#2b3f72", "#141c33", "#3a3f82", "#1b2440"],
  sheen: "#ffffff",
  sheenOpacity: 0.5,

  ok: oklch(0.6, 0.14, 170),
  grid: "#0a1024",
  gridOpacity: 0.07,
};

export const THEMES = [DARK, LIGHT];

// Type stacks. An SVG loaded through <img> cannot fetch webfonts, so the
// Unbounded/Onest/JetBrains pairing from the recipe is unavailable and the
// system stacks stand in. Cyrillic coverage is the constraint that rules out
// most decorative fallbacks.
export const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";
export const FONT_MONO =
  "ui-monospace, 'SF Mono', 'Cascadia Mono', 'DejaVu Sans Mono', Menlo, Consolas, monospace";

// GitHub's linguist colours, for the languages this org actually uses. Falling
// back to a neutral keeps an unmapped language from inventing a hue that would
// break the one-accent rule.
export const LANG_COLORS = {
  Python: "#3572A5",
  HTML: "#e34c26",
  Shell: "#89e051",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  CSS: "#663399",
  SCSS: "#c6538c",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Jinja: "#a52a22",
  Mako: "#7e858d",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  PHP: "#4F5D95",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  PowerShell: "#012456",
  Batchfile: "#C1F12E",
  Roff: "#ecdebe",
  Procfile: "#a91e50",
  Nix: "#7e7eff",
  Lua: "#000080",
};

export function langColor(name) {
  return LANG_COLORS[name] || "#8b8d98";
}

/** `rgba()` string from a hex base plus an alpha, for hairlines and washes. */
export function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
