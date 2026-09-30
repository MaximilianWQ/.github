// Shared SVG primitives for the Liquid Glass panels.
//
// DEPTH RECIPE: translucent white bodies over a coloured aurora, a specular rim
// that fades from top to bottom, and a highlight streak along the upper edge.
// SVG in <img> has no backdrop-filter, so the "frost" is simulated by the
// aurora being soft enough to read as already blurred.

import { alpha, FONT_MONO, FONT_SANS } from "./theme.mjs";
import { esc, measure, measureMono } from "./text.mjs";

export const PANEL_W = 880;
export const INSET = 28;
export const CONTENT_W = PANEL_W - INSET * 2;
export const RADIUS = 16;

let uid = 0;
/** Unique id per document, so multiple defs of the same kind cannot collide. */
export function nextId(prefix) {
  uid += 1;
  return `${prefix}${uid}`;
}

/** Reset ids between documents, keeping output stable across runs. */
export function resetIds() {
  uid = 0;
}

/**
 * Shared stylesheet. Motion is CSS rather than SMIL specifically so that
 * prefers-reduced-motion can switch it off — SMIL has no media-query escape
 * hatch, and an animation a user cannot stop is an accessibility failure.
 */
export function styles(t) {
  return `
  text { font-family: ${FONT_SANS}; }
  .mono { font-family: ${FONT_MONO}; font-variant-numeric: tabular-nums; }
  .caps { letter-spacing: .1em; text-transform: uppercase; }

  @keyframes sheen  { from { transform: translateX(-120%); } to { transform: translateX(260%); } }
  @keyframes rise   { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes slide  { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
  @keyframes grow   { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  @keyframes widen  { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes draw   { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }

  .sheen { animation: sheen 5.5s cubic-bezier(.45,0,.2,1) infinite; }
  .rise  { animation: rise .5s cubic-bezier(.16,1,.3,1) both; }
  .slide { animation: slide .42s cubic-bezier(.16,1,.3,1) both; }
  .bar   { transform-box: fill-box; transform-origin: 50% 100%;
           animation: grow .62s cubic-bezier(.16,1,.3,1) both; }
  .fill  { transform-box: fill-box; transform-origin: 0% 50%;
           animation: widen .8s cubic-bezier(.16,1,.3,1) both; }
  /* The hidden start state lives in the keyframes, never in the static rule.
     A renderer that ignores CSS animations then falls back to the FINISHED
     state — a drawn line, visible text — instead of an empty panel. */
  .spark { stroke-dasharray: 200;
           animation: draw 1.1s cubic-bezier(.16,1,.3,1) both; }

  @media (prefers-reduced-motion: reduce) {
    .sheen { animation: none; opacity: 0; }
    .rise, .slide, .bar, .fill, .spark { animation: none; opacity: 1; transform: none;
                                         stroke-dashoffset: 0; }
  }`;
}

// The document-wide accent gradient (ice → blue), registered by panel() so
// every tick and bar in the same SVG can reference it.
let accentGrad = null;

/** Fill for accent marks: the shared gradient when a panel defined one. */
export function accentFill(t) {
  return accentGrad ? `url(#${accentGrad})` : t.accent;
}

/** A vertical white gradient, used for glass bodies and specular rims. */
function whiteRamp(id, top, bottom, color = "#ffffff") {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="${top}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="${bottom}"/>
  </linearGradient>`;
}

/** A horizontal highlight that peaks mid-way: the specular streak on a glass edge. */
function streak(id, peak) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="${peak}"/>
    <stop offset="70%" stop-color="#ffffff" stop-opacity="${peak * 0.35}"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>`;
}

/**
 * The panel shell — LIQUID GLASS.
 * Ink canvas, an aurora of three soft radial blobs, a translucent glass body,
 * a specular rim that is bright on top and fades down, and a streak of light
 * along the upper edge.
 */
export function panel(t, height, { wash = true } = {}) {
  const grad = nextId("accent");
  const body = nextId("glass");
  const rim = nextId("rim");
  const spec = nextId("spec");
  accentGrad = grad;

  // Blob anchors (cx, cy, r) in bounding-box units. They are spread so every
  // panel, tall or short, catches colour at a corner and one edge.
  const spots = [
    [0.08, 0.0, 0.55],
    [0.95, 0.15, 0.5],
    [0.55, 1.15, 0.6],
  ];
  const blobIds = spots.map(() => nextId("aurora"));
  const blobDefs = wash
    ? spots
        .map(([cx, cy, r], i) => {
          const [color, op] = t.aurora[i];
          return `<radialGradient id="${blobIds[i]}" cx="${cx}" cy="${cy}" r="${r}">
            <stop offset="0%" stop-color="${color}" stop-opacity="${op}"/>
            <stop offset="55%" stop-color="${color}" stop-opacity="${op * 0.35}"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </radialGradient>`;
        })
        .join("")
    : "";

  const defs =
    `<linearGradient id="${grad}" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0%" stop-color="${t.accent}"/>
       <stop offset="100%" stop-color="${t.accentDim}"/>
     </linearGradient>` +
    blobDefs +
    whiteRamp(body, t.glass[0] * 0.6, t.glass[1] * 0.4) +
    whiteRamp(rim, t.rim[0] * 0.7, t.rim[1] * 0.5) +
    streak(spec, t.specular * 0.8);

  const R = RADIUS + 4;
  return {
    defs,
    body:
      `<rect width="${PANEL_W}" height="${height}" rx="${R}" fill="${t.bg}"/>` +
      (wash ? blobIds.map((id) => `<rect width="${PANEL_W}" height="${height}" rx="${R}" fill="url(#${id})"/>`).join("") : "") +
      `<rect width="${PANEL_W}" height="${height}" rx="${R}" fill="url(#${body})"/>` +
      `<rect x=".5" y=".5" width="${PANEL_W - 1}" height="${height - 1}" rx="${R - 0.5}" ` +
      `fill="none" stroke="${alpha(t.line, t.lineOpacity)}"/>` +
      `<rect x=".5" y=".5" width="${PANEL_W - 1}" height="${height - 1}" rx="${R - 0.5}" ` +
      `fill="none" stroke="url(#${rim})"/>` +
      `<path d="M${R} 1 H${PANEL_W - R}" stroke="url(#${spec})" stroke-width="1.2" fill="none"/>`,
  };
}

/** A glass card: translucent body, specular rim, top highlight streak. */
export function card(t, x, y, w, h) {
  const body = nextId("cardglass");
  const rim = nextId("cardrim");
  const spec = nextId("cardspec");
  const R = 14;
  return {
    defs: whiteRamp(body, t.glass[0], t.glass[1]) + whiteRamp(rim, t.rim[0], t.rim[1]) + streak(spec, t.specular),
    body:
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${R}" fill="url(#${body})"/>` +
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${R - 0.5}" ` +
      `fill="none" stroke="${alpha(t.line, t.lineSoftOpacity)}"/>` +
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${R - 0.5}" ` +
      `fill="none" stroke="url(#${rim})"/>` +
      `<path d="M${x + R} ${y + 1} H${x + w - R}" stroke="url(#${spec})" stroke-width="1" fill="none"/>`,
  };
}

/** A small glass pill with a glowing status dot, e.g. "активен". */
export function pill(t, { x, y, label, anchor = "end" }) {
  const w = measure(label.toUpperCase(), 8.5, 700) * 1.45 + 30;
  const left = anchor === "end" ? x - w : x;
  return (
    `<rect x="${left}" y="${y}" width="${w}" height="20" rx="10" fill="${alpha(t.accent, 0.12)}" ` +
    `stroke="${alpha(t.accent, 0.35)}"/>` +
    `<circle cx="${left + 11}" cy="${y + 10}" r="3" fill="${t.accent}"/>` +
    `<circle cx="${left + 11}" cy="${y + 10}" r="5.5" fill="${t.accent}" opacity=".22"/>` +
    text(t, { x: left + 19, y: y + 13.5, content: label.toUpperCase(), size: 8.5, weight: 700, fill: t.accent, tracking: "0.12em" })
  );
}

/**
 * SIGNATURE — the Signal Tick.
 * One 2px accent left-marker, repeated on every heading, card and feed row. A
 * single primitive reused everywhere is what makes the set read as authored
 * rather than assembled.
 */
export function tick(t, x, y, h = 16, color = null) {
  return `<rect x="${x}" y="${y}" width="2.5" height="${h}" rx="1.25" fill="${color || accentFill(t)}"/>`;
}

/**
 * Wrap content in an animated group.
 *
 * The explicit opacity="1" presentation attribute is the safety net: when CSS
 * animations run, the animation's fill state overrides it and the group fades
 * in; when they do not run at all, the attribute stands and the content is
 * simply visible. Without it, `from { opacity: 0 }` plus `fill-mode: both`
 * leaves the panel permanently blank in any non-animating renderer.
 */
export function animGroup(cls, delayMs, content) {
  const delay = delayMs ? ` animation-delay:${(delayMs / 1000).toFixed(3)}s;` : "";
  return `<g class="${cls}" opacity="1" style="${delay}">${content}</g>`;
}

/** A text run. Sizes and weights come from the type ramp, never eyeballed. */
export function text(
  t,
  { x, y, content, size = 13, weight = 400, fill, anchor = "start", mono = false, cls = "", opacity, tracking }
) {
  const classes = [mono ? "mono" : "", cls].filter(Boolean).join(" ");
  // Same safety net as animGroup: a fade-in class must never be the only thing
  // making the text visible.
  const resolvedOpacity =
    opacity === undefined && /\b(rise|slide)\b/.test(cls) ? 1 : opacity;
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `font-size="${size}"`,
    `font-weight="${weight}"`,
    `fill="${fill || t.text}"`,
    anchor !== "start" ? `text-anchor="${anchor}"` : "",
    classes ? `class="${classes}"` : "",
    resolvedOpacity !== undefined ? `opacity="${resolvedOpacity}"` : "",
    tracking ? `letter-spacing="${tracking}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<text ${attrs}>${esc(content)}</text>`;
}

/** An all-caps micro label. Tracking is positive per the type rules. */
export function capsLabel(t, { x, y, content, size = 9.5, fill, anchor = "start", weight = 600 }) {
  return text(t, {
    x,
    y,
    content: content.toUpperCase(),
    size,
    weight,
    fill: fill || t.text4,
    anchor,
    tracking: "0.11em",
  });
}

/** Section heading: tick + caps title, an optional right note, and a rule. */
export function sectionHead(t, { x, y, title, note }) {
  const parts = [
    tick(t, x, y - 11, 13),
    text(t, { x: x + 12, y, content: title.toUpperCase(), size: 12, weight: 700, fill: t.text2, tracking: "0.13em" }),
  ];
  if (note) {
    parts.push(capsLabel(t, { x: x + CONTENT_W, y, content: note, anchor: "end", size: 9.5 }));
  }
  parts.push(
    `<path d="M${x} ${y + 16.5} H${x + CONTENT_W}" stroke="${alpha(t.line, t.lineSoftOpacity)}" stroke-width="1"/>`
  );
  return parts.join("");
}

/** Assemble a complete SVG document. */
export function document_(t, height, defs, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PANEL_W}" height="${height}" ` +
    `viewBox="0 0 ${PANEL_W} ${height}" role="img">` +
    `<style>${styles(t)}</style>` +
    `<defs>${defs}</defs>` +
    body +
    `</svg>`
  );
}

export { esc, measure, measureMono, alpha, FONT_MONO, FONT_SANS };
