import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

// Vitest runs with the frontend package as its working directory, so paths are
// resolved from the package root. (jsdom's `import.meta.url` is not a file: URL.)
const pkgRoot = process.cwd();
const stylesDir = resolve(pkgRoot, 'src/styles');
const publicDir = resolve(pkgRoot, 'public');

const tokensCss = readFileSync(resolve(stylesDir, 'tokens.css'), 'utf8');
const fontsCss = readFileSync(resolve(stylesDir, 'fonts.css'), 'utf8');
const indexCss = readFileSync(resolve(stylesDir, 'index.css'), 'utf8');

/**
 * The 28 semantic color token names from DESIGN.md. Both the Light (`:root`)
 * and Dark (`.dark`) blocks must declare every one of these.
 */
const COLOR_TOKENS = [
  'brand',
  'brand-hover',
  'brand-active',
  'brand-tint',
  'brand-subtle',
  'bg',
  'surface',
  'surface-elevated',
  'border',
  'border-strong',
  'text',
  'text-muted',
  'text-disabled',
  'success',
  'success-bg',
  'success-border',
  'warning',
  'warning-bg',
  'warning-border',
  'danger',
  'danger-bg',
  'danger-border',
  'info',
  'info-bg',
  'info-border',
  'disabled-bg',
  'disabled-border',
] as const;

/** Extract the body of a `selector { ... }` block from CSS source. */
function extractBlock(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`block not found: ${selector}`);
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`unterminated block: ${selector}`);
}

/** Read a `--color-<token>` value from a CSS block body. */
function readVar(block: string, token: string): string | undefined {
  const m = block.match(new RegExp(`--color-${token}\\s*:\\s*([^;]+);`));
  return m?.[1]?.trim();
}

/** Read any `--<name>` custom property value from a CSS block body. */
function readProp(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  return m?.[1]?.trim();
}

/**
 * The authoritative DESIGN.md Light Mode hex values (lowercased to the project's
 * CSS convention) for ALL 28 color tokens. Any drift from DESIGN.md fails here —
 * this is the full AD-10 contract, not a spot check.
 */
const LIGHT_HEX: Record<string, string> = {
  brand: '#3e3a98',
  'brand-hover': '#4a46c8',
  'brand-active': '#3230a0',
  'brand-tint': '#eae8ff',
  'brand-subtle': '#f0eeff',
  bg: '#f8f7fd',
  surface: '#ffffff',
  'surface-elevated': '#fafafe',
  border: '#e8e6ff',
  'border-strong': '#c7c4f0',
  text: '#1a1a2e',
  'text-muted': '#6b6b8a',
  'text-disabled': '#b0aed8',
  success: '#15803d',
  'success-bg': '#dcfce7',
  'success-border': '#86efac',
  warning: '#92400e',
  'warning-bg': '#fef9c3',
  'warning-border': '#fde68a',
  danger: '#991b1b',
  'danger-bg': '#fee2e2',
  'danger-border': '#fca5a5',
  info: '#5b21b6',
  'info-bg': '#ede9fe',
  'info-border': '#c4b5fd',
  'disabled-bg': '#f3f2fc',
  'disabled-border': '#dddaf5',
};

/**
 * Authoritative DESIGN.md Dark Mode hex values. The four status `-border` tokens
 * are intentionally OMITTED here: DESIGN.md's Dark Mode table does not define
 * them. tokens.css carries the Light values forward as a documented gap-fill
 * (see spec Implementation Notes); when DESIGN.md adds authoritative dark
 * `-border` values before Story 1.6, add them here to lock them.
 */
const DARK_HEX: Record<string, string> = {
  brand: '#6562e8',
  'brand-hover': '#7572f0',
  'brand-active': '#5452d8',
  'brand-tint': '#252347',
  'brand-subtle': '#1e1d3a',
  bg: '#13122a',
  surface: '#171630',
  'surface-elevated': '#1e1d3a',
  border: '#252347',
  'border-strong': '#3a3870',
  text: '#e0deff',
  'text-muted': '#8080a8',
  'text-disabled': '#4a4880',
  success: '#34d399',
  'success-bg': '#052e16',
  warning: '#fbbf24',
  'warning-bg': '#451a03',
  danger: '#f87171',
  'danger-bg': '#3b0707',
  info: '#a78bfa',
  'info-bg': '#2e1065',
  'disabled-bg': '#1a1935',
  'disabled-border': '#252347',
};

describe('tokens.css — semantic color contract (DESIGN.md / AD-10)', () => {
  const light = extractBlock(tokensCss, ':root');
  const dark = extractBlock(tokensCss, '.dark');

  it('declares all 28 color tokens in both :root and .dark', () => {
    for (const token of COLOR_TOKENS) {
      expect(readVar(light, token), `:root missing --color-${token}`).toBeDefined();
      expect(readVar(dark, token), `.dark missing --color-${token}`).toBeDefined();
    }
  });

  it('matches the DESIGN.md Light Mode values exactly for all 28 tokens', () => {
    for (const [token, hex] of Object.entries(LIGHT_HEX)) {
      expect(readVar(light, token), `:root --color-${token}`).toBe(hex);
    }
  });

  it('matches the DESIGN.md Dark Mode values exactly for every authoritative token', () => {
    for (const [token, hex] of Object.entries(DARK_HEX)) {
      expect(readVar(dark, token), `.dark --color-${token}`).toBe(hex);
    }
  });

  it('carries the four status -border tokens forward in .dark (documented gap-fill)', () => {
    // DESIGN.md omits dark values for these; tokens.css reuses the Light values.
    // This test pins that intentional decision so a silent change is caught.
    for (const token of ['success-border', 'warning-border', 'danger-border', 'info-border']) {
      expect(readVar(dark, token), `.dark --color-${token}`).toBe(LIGHT_HEX[token]);
    }
  });

  it('dark mode overrides (not inverts) brand and surface', () => {
    expect(readVar(light, 'brand')).not.toBe(readVar(dark, 'brand'));
    expect(readVar(light, 'surface')).not.toBe(readVar(dark, 'surface'));
  });
});

describe('tokens.css — typography / spacing / radius scale (DESIGN.md)', () => {
  const light = extractBlock(tokensCss, ':root');

  it('declares the type size scale exactly per DESIGN.md', () => {
    const sizes: Record<string, string> = {
      'text-xs': '11px',
      'text-sm': '12px',
      'text-base': '13px',
      'text-md': '14px',
      'text-lg': '16px',
      'text-xl': '20px',
      'text-2xl': '24px',
      'text-3xl': '32px',
    };
    for (const [name, value] of Object.entries(sizes)) {
      expect(readProp(light, name), name).toBe(value);
    }
  });

  it('declares font weights and line heights exactly per DESIGN.md', () => {
    const scale: Record<string, string> = {
      'weight-normal': '400',
      'weight-medium': '500',
      'weight-semibold': '600',
      'weight-bold': '700',
      'weight-extrabold': '800',
      'leading-base': '1.5',
      'leading-sinhala': '1.75',
      'leading-heading': '1.2',
    };
    for (const [name, value] of Object.entries(scale)) {
      expect(readProp(light, name), name).toBe(value);
    }
  });

  it('declares the 4px spacing grid and radius scale exactly per DESIGN.md', () => {
    const scale: Record<string, string> = {
      'space-1': '4px',
      'space-2': '8px',
      'space-3': '12px',
      'space-4': '16px',
      'space-6': '24px',
      'space-12': '48px',
      'radius-sm': '4px',
      'radius-md': '8px',
      'radius-lg': '12px',
      'radius-xl': '16px',
      'radius-full': '9999px',
    };
    for (const [name, value] of Object.entries(scale)) {
      expect(readProp(light, name), name).toBe(value);
    }
  });

  it('declares the English and Sinhala font stacks per DESIGN.md', () => {
    expect(readProp(light, 'font-sans-en')).toMatch(/'Inter'/);
    expect(readProp(light, 'font-sans-si')).toMatch(/'Noto Sans Sinhala'/);
  });
});

describe('index.css — Sinhala base-layer typography rules (DESIGN.md)', () => {
  it('switches the root family to the Sinhala stack for html[lang="si"]', () => {
    expect(indexCss).toMatch(/html\[lang='si'\]\s*\{[^}]*font-family:\s*var\(--font-sans-si\)/);
  });

  it('raises Sinhala body line-height to the 1.75 token (vowel diacritics)', () => {
    expect(indexCss).toMatch(
      /html\[lang='si'\]\s*body\s*\{[^}]*line-height:\s*var\(--leading-sinhala\)/,
    );
  });

  it('strips letter-spacing and uppercase transforms from Sinhala text', () => {
    const block = indexCss.match(/html\[lang='si'\]\s*body\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(block).toMatch(/letter-spacing:\s*normal/);
    expect(block).toMatch(/text-transform:\s*none/);
  });
});

describe('index.css — Tailwind v4 dark variant wiring (AD-46)', () => {
  it('declares the @custom-variant dark with :where() zero specificity', () => {
    expect(indexCss).toContain('@custom-variant dark (&:where(.dark, .dark *));');
  });

  it('imports tailwindcss, tokens, and fonts', () => {
    expect(indexCss).toContain("@import 'tailwindcss';");
    expect(indexCss).toContain("@import './tokens.css';");
    expect(indexCss).toContain("@import './fonts.css';");
  });

  it('does not use the forbidden :is() dark selector or @variant', () => {
    expect(indexCss).not.toContain(':is(.dark');
    expect(indexCss).not.toContain('@variant dark');
  });
});

describe('fonts.css — self-hosted fonts (AD-28)', () => {
  it('declares font-display: swap on every @font-face', () => {
    const faces = fontsCss.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    expect(faces.length).toBeGreaterThanOrEqual(2);
    for (const face of faces) {
      expect(face).toContain('font-display: swap');
    }
  });

  it('scopes Noto Sans Sinhala to the Sinhala unicode range', () => {
    expect(fontsCss).toMatch(/Noto Sans Sinhala/);
    expect(fontsCss).toMatch(/unicode-range:\s*U\+0D80-0DFF/);
  });

  it('references same-origin /fonts/ URLs only (no runtime CDN)', () => {
    const urls = [...fontsCss.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(/^'\/fonts\//);
      expect(url).not.toMatch(/https?:/);
    }
  });
});

describe('font payload budget (AD-28: Sinhala subset <= 200 kB)', () => {
  it('ships the Sinhala subset woff2 under 200 kB', () => {
    const file = resolve(publicDir, 'fonts/noto-sans-sinhala-sinhala-wght-normal.woff2');
    const { size } = statSync(file);
    expect(size).toBeLessThanOrEqual(200 * 1024);
  });

  it('ships the Inter latin subset woff2 within a sane budget (<= 150 kB)', () => {
    // Guards against a regression that ships an un-subset full Inter file.
    const file = resolve(publicDir, 'fonts/inter-latin-wght-normal.woff2');
    const { size } = statSync(file);
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThanOrEqual(150 * 1024);
  });
});

describe('index.html — font preload hrefs match the shipped fonts', () => {
  const indexHtml = readFileSync(resolve(pkgRoot, 'index.html'), 'utf8');

  it('preloads only fonts that exist on disk and are declared in fonts.css', () => {
    const collect = (re: RegExp): string[] =>
      [...indexHtml.matchAll(re)].map((m) => m[1]).filter((h): h is string => h !== undefined);
    // `<link rel="preload" ... href="...">` — match both attribute orderings.
    const allHrefs = [
      ...collect(/rel="preload"[^>]*?href="(\/fonts\/[^"]+)"/gs),
      ...collect(/href="(\/fonts\/[^"]+)"[^>]*?rel="preload"/gs),
    ];
    expect(allHrefs.length).toBeGreaterThanOrEqual(2);
    for (const href of allHrefs) {
      // The preloaded file must exist in public/ (same path Vite serves).
      expect(() => statSync(resolve(publicDir, href.replace(/^\//, '')))).not.toThrow();
      // ...and must be an actual @font-face src in fonts.css (no dangling 404 preload).
      expect(fontsCss, `fonts.css has no src for preloaded ${href}`).toContain(`url('${href}')`);
    }
  });
});
