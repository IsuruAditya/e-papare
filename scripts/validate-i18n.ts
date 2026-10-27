#!/usr/bin/env node
/**
 * validate-i18n.ts — AD-30 i18n completeness gate.
 *
 * Discovers locale roots across the monorepo and, for every namespace JSON
 * present under `en/`, asserts the same flattened key set exists under `si/`.
 * Reports every missing (in si) and extra (in si) key with its namespace and
 * dotted key path. Exits 1 on any discrepancy, otherwise exits 0.
 *
 * Tolerant of the pre-Story-1.7 empty state: if no locale roots or namespaces
 * exist yet, it prints a "nothing to validate" line and exits 0.
 *
 * Run with Node 24's native type stripping:
 *   node --experimental-strip-types scripts/validate-i18n.ts
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

/** Candidate locale roots. A root is a directory that may contain `en/` and `si/`. */
function discoverLocaleRoots(): string[] {
  const roots: string[] = [];
  const packagesDir = join(repoRoot, 'packages');
  if (!existsSync(packagesDir)) return roots;

  for (const pkg of readdirSync(packagesDir)) {
    const pkgPath = join(packagesDir, pkg);
    if (!isDir(pkgPath)) continue;

    // Frontend-style: packages/*/src/locales
    const srcLocales = join(pkgPath, 'src', 'locales');
    if (isDir(srcLocales)) roots.push(srcLocales);

    // shared-types-style (and any package): packages/*/locales
    const pkgLocales = join(pkgPath, 'locales');
    if (isDir(pkgLocales)) roots.push(pkgLocales);
  }

  return roots;
}

function isDir(p: string): boolean {
  return existsSync(p) && statSync(p).isDirectory();
}

/** Flatten a nested JSON object into dotted key paths. Arrays are treated as leaves. */
function flattenKeys(obj: unknown, prefix = ''): Set<string> {
  const keys = new Set<string>();
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    if (prefix) keys.add(prefix);
    return keys;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      for (const nested of flattenKeys(v, path)) keys.add(nested);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function relativeToRepo(p: string): string {
  return p.slice(repoRoot.length + 1).replace(/\\/g, '/');
}

interface Discrepancy {
  root: string;
  namespace: string;
  missingInSi: string[];
  extraInSi: string[];
}

function main(): number {
  const roots = discoverLocaleRoots();
  const discrepancies: Discrepancy[] = [];
  let namespacesChecked = 0;

  for (const root of roots) {
    const enDir = join(root, 'en');
    if (!isDir(enDir)) continue;

    const enFiles = readdirSync(enDir).filter((f) => f.endsWith('.json'));
    for (const file of enFiles) {
      namespacesChecked++;
      const namespace = file.replace(/\.json$/, '');
      const enPath = join(enDir, file);
      const siPath = join(root, 'si', file);

      const enKeys = flattenKeys(readJson(enPath));
      const siKeys =
        isDir(join(root, 'si')) && existsSync(siPath)
          ? flattenKeys(readJson(siPath))
          : new Set<string>();

      const missingInSi = [...enKeys].filter((k) => !siKeys.has(k)).sort();
      const extraInSi = [...siKeys].filter((k) => !enKeys.has(k)).sort();

      if (missingInSi.length > 0 || extraInSi.length > 0) {
        discrepancies.push({ root: relativeToRepo(root), namespace, missingInSi, extraInSi });
      }
    }
  }

  if (namespacesChecked === 0) {
    console.log('[validate-i18n] No locale namespaces found — nothing to validate yet.');
    return 0;
  }

  if (discrepancies.length === 0) {
    console.log(
      `[validate-i18n] OK — ${namespacesChecked} namespace(s) checked; en/ and si/ key sets match.`,
    );
    return 0;
  }

  console.error('[validate-i18n] FAILED — en/ and si/ key sets diverge:\n');
  for (const d of discrepancies) {
    console.error(`  ${d.root} :: ${d.namespace}`);
    for (const k of d.missingInSi) {
      console.error(`    missing in si: ${k}`);
    }
    for (const k of d.extraInSi) {
      console.error(`    extra in si:   ${k}`);
    }
    console.error('');
  }
  console.error(
    '[validate-i18n] Every en/ key must have a matching si/ key (and vice versa). Fix the Sinhala locale files above.',
  );
  return 1;
}

process.exit(main());
