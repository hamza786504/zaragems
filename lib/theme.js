// Single source of truth for the storefront's dynamic theme (colors + typography).
//
// Framework-agnostic on purpose: this module is imported by the Next.js app
// (layout, API route, settings page) AND by the Sanity Studio schema, so it must
// not import any Next/React-specific APIs.
//
// The storefront's Tailwind color utilities are defined as `var(--color-<token>,
// #fallback)` (see tailwind.config.js). At runtime the public layout injects those
// CSS variables from the DB-backed `siteSettings.theme`, so the whole frontend
// re-themes without a rebuild. Fonts ride on the existing `--font-eb-garamond` /
// `--font-manrope` variables plus a runtime Google Fonts <link>.

// Fonts that are already loaded at build time via next/font (app/layout.jsx).
// When the admin picks one of these we DON'T inject a duplicate Google Fonts link
// and DON'T override the font CSS variable — next/font already handles it.
export const PRELOADED_FONTS = ['EB Garamond', 'Manrope'];

// Default typography = the fonts currently wired up in app/layout.jsx.
export const DEFAULT_TYPOGRAPHY = {
  headingFont: 'EB Garamond',
  bodyFont: 'Manrope',
};

// The live (dashboard) color values currently compiled into Tailwind. These are the
// fallbacks used when a token is missing from the DB. Kept in sync with the
// `var(--color-*, #fallback)` values in tailwind.config.js.
export const DEFAULT_PALETTE = {
  'on-surface': '#181c1f',
  'on-surface-variant': '#3e4944',
  'on-error-container': '#93000a',
  'primary-fixed': '#92f6cf',
  'on-error': '#ffffff',
  'surface-container-lowest': '#ffffff',
  'surface-container-highest': '#dfe3e7',
  'inverse-surface': '#2d3134',
  background: '#f6fafe',
  'on-primary': '#ffffff',
  'primary-container': '#008060',
  'on-tertiary': '#ffffff',
  'error': '#ba1a1a',
  'inverse-primary': '#75d9b3',
  'tertiary-fixed-dim': '#ffb4ab',
  'surface-container': '#ebeef3',
  'surface-container-high': '#e5e8ed',
  'secondary-fixed-dim': '#c6c6c7',
  'surface-dim': '#d7dadf',
  'surface-tint': '#006c50',
  'on-secondary-fixed': '#1a1c1d',
  'on-background': '#181c1f',
  'on-secondary': '#ffffff',
  'surface-container-low': '#f1f4f8',
  'on-tertiary-fixed-variant': '#7a2e28',
  surface: '#f6fafe',
  secondary: '#5d5e60',
  'inverse-on-surface': '#eef1f5',
  'on-secondary-fixed-variant': '#454748',
  'secondary-fixed': '#e2e2e3',
  'outline-variant': '#bdc9c2',
  'surface-variant': '#dfe3e7',
  'tertiary-container': '#ae564d',
  'on-primary-container': '#d6ffeb',
  primary: '#00654b',
  'on-primary-fixed': '#002116',
  'on-tertiary-container': '#fff2f1',
  'primary-fixed-dim': '#75d9b3',
  'on-primary-fixed-variant': '#00513c',
  'tertiary-fixed': '#ffdad6',
  'secondary-container': '#dfdfe0',
  tertiary: '#8f3f37',
  'surface-bright': '#f6fafe',
  outline: '#6e7a73',
  'error-container': '#ffdad6',
  'on-tertiary-fixed': '#3f0303',
  'on-secondary-container': '#616364'
};

// Every themeable color token, grouped for the admin UI. `key` matches both the
// Tailwind token name and the DB field name under `siteSettings.theme`.
export const THEME_TOKENS = [
  // Brand
  { key: 'primary', label: 'Primary', group: 'Brand' },
  { key: 'on-primary', label: 'On Primary', group: 'Brand' },
  { key: 'primary-container', label: 'Primary Container', group: 'Brand' },
  { key: 'on-primary-container', label: 'On Primary Container', group: 'Brand' },
  { key: 'primary-fixed', label: 'Primary Fixed', group: 'Brand' },
  { key: 'primary-fixed-dim', label: 'Primary Fixed Dim', group: 'Brand' },
  { key: 'on-primary-fixed', label: 'On Primary Fixed', group: 'Brand' },
  { key: 'on-primary-fixed-variant', label: 'On Primary Fixed Variant', group: 'Brand' },
  { key: 'inverse-primary', label: 'Inverse Primary', group: 'Brand' },
  // Secondary
  { key: 'secondary', label: 'Secondary', group: 'Secondary' },
  { key: 'on-secondary', label: 'On Secondary', group: 'Secondary' },
  { key: 'secondary-container', label: 'Secondary Container', group: 'Secondary' },
  { key: 'on-secondary-container', label: 'On Secondary Container', group: 'Secondary' },
  { key: 'secondary-fixed', label: 'Secondary Fixed', group: 'Secondary' },
  { key: 'secondary-fixed-dim', label: 'Secondary Fixed Dim', group: 'Secondary' },
  { key: 'on-secondary-fixed', label: 'On Secondary Fixed', group: 'Secondary' },
  { key: 'on-secondary-fixed-variant', label: 'On Secondary Fixed Variant', group: 'Secondary' },
  // Tertiary
  { key: 'tertiary', label: 'Tertiary', group: 'Tertiary' },
  { key: 'on-tertiary', label: 'On Tertiary', group: 'Tertiary' },
  { key: 'tertiary-container', label: 'Tertiary Container', group: 'Tertiary' },
  { key: 'on-tertiary-container', label: 'On Tertiary Container', group: 'Tertiary' },
  { key: 'tertiary-fixed', label: 'Tertiary Fixed', group: 'Tertiary' },
  { key: 'tertiary-fixed-dim', label: 'Tertiary Fixed Dim', group: 'Tertiary' },
  { key: 'on-tertiary-fixed', label: 'On Tertiary Fixed', group: 'Tertiary' },
  { key: 'on-tertiary-fixed-variant', label: 'On Tertiary Fixed Variant', group: 'Tertiary' },
  // Surface & Background
  { key: 'background', label: 'Background', group: 'Surface & Background' },
  { key: 'surface', label: 'Surface', group: 'Surface & Background' },
  { key: 'on-surface', label: 'On Surface', group: 'Surface & Background' },
  { key: 'on-background', label: 'On Background', group: 'Surface & Background' },
  { key: 'on-surface-variant', label: 'On Surface Variant', group: 'Surface & Background' },
  { key: 'surface-bright', label: 'Surface Bright', group: 'Surface & Background' },
  { key: 'surface-dim', label: 'Surface Dim', group: 'Surface & Background' },
  { key: 'surface-variant', label: 'Surface Variant', group: 'Surface & Background' },
  { key: 'surface-tint', label: 'Surface Tint', group: 'Surface & Background' },
  { key: 'inverse-surface', label: 'Inverse Surface', group: 'Surface & Background' },
  { key: 'inverse-on-surface', label: 'Inverse On Surface', group: 'Surface & Background' },
  // Surface Containers
  { key: 'surface-container', label: 'Surface Container', group: 'Surface Containers' },
  { key: 'surface-container-low', label: 'Surface Container Low', group: 'Surface Containers' },
  { key: 'surface-container-lowest', label: 'Surface Container Lowest', group: 'Surface Containers' },
  { key: 'surface-container-high', label: 'Surface Container High', group: 'Surface Containers' },
  { key: 'surface-container-highest', label: 'Surface Container Highest', group: 'Surface Containers' },
  // Outline & Error
  { key: 'outline', label: 'Outline', group: 'Outline & Error' },
  { key: 'outline-variant', label: 'Outline Variant', group: 'Outline & Error' },
  { key: 'error', label: 'Error', group: 'Outline & Error' },
  { key: 'on-error', label: 'On Error', group: 'Outline & Error' },
  { key: 'error-container', label: 'Error Container', group: 'Outline & Error' },
  { key: 'on-error-container', label: 'On Error Container', group: 'Outline & Error' },
];

// Group order for rendering (stable, predictable admin UI).
export const THEME_GROUPS = [
  'Brand',
  'Secondary',
  'Tertiary',
  'Surface & Background',
  'Surface Containers',
  'Outline & Error',
];

// Suggested Google Font families for the admin <datalist> (heading + body combined).
export const GOOGLE_FONTS = [
  // Headings (serif / display)
  'EB Garamond',
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
  'Merriweather',
  'DM Serif Display',
  'Bodoni Moda',
  'Bitter',
  'Spectral',
  // Headings (sans)
  'Poppins',
  'Montserrat',
  'Oswald',
  // Body
  'Manrope',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Source Sans 3',
  'Work Sans',
  'Nunito',
  'DM Sans',
  'PT Sans',
  'Karla',
  'Mulish',
  'Roboto Slab',
];

// Weights requested from Google Fonts for every chosen family. Covers the weights
// the Tailwind font-size tokens use (400/500/600/700).
const GOOGLE_FONT_WEIGHTS = '400;500;600;700';

// Merge a partial DB theme over the defaults so the storefront always has a full,
// renderable palette even when the admin only customized a few tokens.
export function resolvePalette(theme = {}) {
  return { ...DEFAULT_PALETTE, ...(theme || {}) };
}

export function resolveTypography(typography = {}) {
  return { ...DEFAULT_TYPOGRAPHY, ...(typography || {}) };
}

// Build the inline CSS-variable style object injected onto the storefront wrapper.
// e.g. { '--color-primary': '#00654b', '--color-surface': '#f6fafe', ... }
export function buildThemeVars(theme = {}) {
  const resolved = resolvePalette(theme);
  const vars = {};
  for (const token of THEME_TOKENS) {
    const value = resolved[token.key];
    if (value) vars[`--color-${token.key}`] = value;
  }
  return vars;
}

// Build font CSS-variable overrides. Only non-preloaded fonts get an override;
// preloaded fonts keep the next/font value already set on <html>.
function fontVarValue(font, fallback) {
  const name = (font || '').trim();
  if (!name) return null;
  // Wrap in quotes so multi-word families ("Playfair Display") are valid.
  return `'${name}', ${fallback}`;
}

export function buildFontVars(typography = {}) {
  const { headingFont, bodyFont } = resolveTypography(typography);
  const vars = {};
  const heading = fontVarValue(headingFont, 'serif');
  const body = fontVarValue(bodyFont, 'sans-serif');
  if (heading && !PRELOADED_FONTS.includes(headingFont)) vars['--font-eb-garamond'] = heading;
  if (body && !PRELOADED_FONTS.includes(bodyFont)) vars['--font-manrope'] = body;
  return vars;
}

// Build a scoped CSS block for a <style> tag in <head>. This is preferred over
// injecting vars as a React inline `style` object on a div because:
//   • Applied by the CSS engine before any paint — zero FOUC risk
//   • Costs nothing during React hydration (no DOM reconciliation)
//   • Part of the ISR-cached HTML — served from CDN, not recomputed per request
//   • Scoped to `selector` so the admin dashboard is never affected
export function buildThemeCss(theme = {}, typography = {}, selector = '.storefront-theme') {
  const vars = { ...buildThemeVars(theme), ...buildFontVars(typography) };
  const entries = Object.entries(vars);
  if (entries.length === 0) return '';
  // Minified: no spaces/newlines — keeps HTML payload small
  return `${selector}{${entries.map(([k, v]) => `${k}:${v}`).join(';')}}`;
}


// Build the Google Fonts stylesheet href for any non-preloaded fonts. Returns null
// when nothing needs loading (both fonts are the build-time defaults).
export function buildGoogleFontsHref(typography = {}) {
  const { headingFont, bodyFont } = resolveTypography(typography);
  const families = [];
  if (headingFont && !PRELOADED_FONTS.includes(headingFont)) families.push(headingFont);
  if (bodyFont && !PRELOADED_FONTS.includes(bodyFont)) families.push(bodyFont);
  if (families.length === 0) return null;

  const params = families
    .map((f) => `${encodeURIComponent(f)}:wght@${GOOGLE_FONT_WEIGHTS}`)
    .join('&family=');
  return `https://fonts.googleapis.com/css2?family=${params}&display=swap`;
}

// ---------------------------------------------------------------------------
// Color palette presets
//
// A preset is described compactly by 4 brand anchors (primary / secondary /
// tertiary / error). buildPreset() expands those into the full token map by
// deriving tonal ramps, keeping the neutral/surface tokens from DEFAULT_PALETTE.
// This keeps the presets small and guarantees a coherent palette per role while
// the per-token custom editor (in the admin) lets the admin fine-tune anything.
// ---------------------------------------------------------------------------

// --- pure color helpers (no deps; safe to import from the Sanity schema too) ---
function hexToRgb(hex) {
  let h = (hex || '').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  let r;
  let g;
  let b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b]
    .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
    .join('');
}

function hexToHsl(hex) {
  return rgbToHsl(hexToRgb(hex));
}

function hslToHex(hsl) {
  return rgbToHex(hslToRgb(hsl));
}

// Returns a hex with the same hue/saturation as `hex` but the given lightness (0–1).
export function setLightness(hex, l) {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: Math.max(0, Math.min(1, l)) });
}

// White for dark fills, near-black for light fills (perceived luminance threshold).
export function contrastText(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1c1b1b' : '#ffffff';
}

// Expand one base brand color into its full role ramp.
function brandRamp(hex, prefix) {
  const map = {};
  map[prefix] = hex;
  map[`on-${prefix}`] = contrastText(hex);
  map[`${prefix}-container`] = setLightness(hex, 0.9);
  map[`on-${prefix}-container`] = setLightness(hex, 0.22);
  map[`${prefix}-fixed`] = setLightness(hex, 0.92);
  map[`${prefix}-fixed-dim`] = setLightness(hex, 0.8);
  map[`on-${prefix}-fixed`] = setLightness(hex, 0.18);
  map[`on-${prefix}-fixed-variant`] = setLightness(hex, 0.3);
  if (prefix === 'primary') map['inverse-primary'] = setLightness(hex, 0.78);
  return map;
}

function errorRamp(hex) {
  return {
    error: hex,
    'on-error': contrastText(hex),
    'error-container': setLightness(hex, 0.92),
    'on-error-container': setLightness(hex, 0.2),
  };
}

// Build a complete token map from 4 brand anchors. Neutral/surface tokens keep
// their DEFAULT_PALETTE values, so only the brand + error hues change.
export function buildPreset(anchors = {}) {
  const { primary, secondary, tertiary, error } = anchors;
  let theme = { ...DEFAULT_PALETTE };
  if (primary) theme = { ...theme, ...brandRamp(primary, 'primary') };
  if (secondary) theme = { ...theme, ...brandRamp(secondary, 'secondary') };
  if (tertiary) theme = { ...theme, ...brandRamp(tertiary, 'tertiary') };
  if (error) theme = { ...theme, ...errorRamp(error) };
  return theme;
}

// Curated presets shown as swatch cards in the admin. `baseline: true` means
// "use the storefront defaults" (theme = null) — i.e. the current live look.
export const THEME_PRESETS = [
  { name: 'emerald', label: 'Emerald', baseline: true },
  {
    name: 'midnight',
    label: 'Midnight',
    anchors: { primary: '#1a4d8f', secondary: '#5b6470', tertiary: '#7b4fb0', error: '#c62828' },
  },
  {
    name: 'rose',
    label: 'Rose',
    anchors: { primary: '#9c2750', secondary: '#6d4c41', tertiary: '#c25b8f', error: '#c62828' },
  },
  {
    name: 'amber',
    label: 'Amber',
    anchors: { primary: '#8a5a00', secondary: '#5d5e60', tertiary: '#9c6b1f', error: '#b3261e' },
  },
  {
    name: 'graphite',
    label: 'Graphite',
    anchors: { primary: '#3c4043', secondary: '#5f6368', tertiary: '#202124', error: '#b3261e' },
  },
];

// Primary swatch color for a preset card preview.
export function presetPrimaryHex(preset) {
  if (preset.baseline) return DEFAULT_PALETTE.primary;
  return preset.anchors?.primary || DEFAULT_PALETTE.primary;
}

// Helper to adjust lightness of a color by delta (positive = lighter, negative = darker)
export function adjustLightness(hex, delta) {
  const hsl = hexToHsl(hex);
  return setLightness(hex, hsl.l + delta);
}

// Mix two hex colors by weight (0 = a, 1 = b).
export function mix(hexA, hexB, weight) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex({
    r: a.r + (b.r - a.r) * w,
    g: a.g + (b.g - a.g) * w,
    b: a.b + (b.b - a.b) * w,
  });
}

// Extract the 8 base controls from a full theme map (used to populate the UI).
export function extractBaseControls(theme) {
  const t = theme || DEFAULT_PALETTE;
  return {
    primary: t.primary,
    secondary: t.secondary,
    tertiary: t.tertiary,
    error: t.error,
    background: t.background,
    surface: t.surface,
    onSurface: t['on-surface'],
    outline: t.outline,
  };
}

// Build a complete token map from the 8 base controls.
// Brand ramps (primary/secondary/tertiary/error) derive their full families.
// Neutral/surface tokens derive from background/surface/onSurface/outline.
export function buildThemeFromControls(controls = {}) {
  const {
    primary, secondary, tertiary, error,
    background, surface, onSurface, outline,
  } = controls;

  let theme = { ...DEFAULT_PALETTE };

  // Brand ramps
  if (primary) theme = { ...theme, ...brandRamp(primary, 'primary') };
  if (secondary) theme = { ...theme, ...brandRamp(secondary, 'secondary') };
  if (tertiary) theme = { ...theme, ...brandRamp(tertiary, 'tertiary') };
  if (error) theme = { ...theme, ...errorRamp(error) };

  // Neutrals / surfaces
  if (background) {
    theme.background = background;
    theme['surface-bright'] = adjustLightness(background, 0.02);
    theme['surface-dim'] = adjustLightness(background, -0.03);
  }
  if (surface) {
    theme.surface = surface;
    theme['surface-container-lowest'] = adjustLightness(surface, 0.04);
    theme['surface-container-low'] = adjustLightness(surface, 0.02);
    theme['surface-container'] = adjustLightness(surface, -0.01);
    theme['surface-container-high'] = adjustLightness(surface, -0.03);
    theme['container-highest'] = adjustLightness(surface, -0.05);
    theme['surface-variant'] = mix(surface, onSurface || DEFAULT_PALETTE['on-surface'], 0.12);
  }
  if (onSurface) {
    theme['on-surface'] = onSurface;
    theme['on-background'] = onSurface;
    theme['on-surface-variant'] = mix(onSurface, surface || DEFAULT_PALETTE.surface, 0.45);
    theme['inverse-surface'] = onSurface;
    theme['inverse-on-surface'] = background || DEFAULT_PALETTE.background;
  }
  if (outline) {
    theme.outline = outline;
    theme['outline-variant'] = mix(outline, surface || DEFAULT_PALETTE.surface, 0.55);
  }
  if (primary) theme['surface-tint'] = primary;

  return theme;
}