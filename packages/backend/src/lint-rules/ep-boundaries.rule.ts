/**
 * ep-boundaries/no-cross-module-deep-imports
 *
 * Enforces AD-1: one backend module may not import another module's internal
 * implementation files directly. Cross-module access must go through the
 * module barrel (index) and NestJS dependency injection.
 *
 * Extracted from eslint.config.mjs so it can be unit-tested via RuleTester.
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const noCrossModuleDeepImports: any = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow deep imports of another backend module's internal service/repository (AD-1). Use the module barrel + NestJS DI instead.",
    },
    schema: [],
    messages: {
      crossModule:
        'Cross-module import of "{{target}}" bypasses NestJS DI (AD-1). Import the service from the module barrel "../{{other}}" and inject it instead.',
    },
  },
  create(context: any) {
    const filename: string = (context.filename ?? context.getFilename()).replace(/\\/g, '/');
    const currentMatch = filename.match(/\/modules\/(\w+)\//);
    if (!currentMatch) return {};
    const currentModule = currentMatch[1];
    const importerDir = filename.replace(/\/[^/]+$/, '');

    function resolveRelative(source: string): string {
      const parts = importerDir.split('/');
      for (const seg of source.split('/')) {
        if (seg === '.' || seg === '') continue;
        if (seg === '..') parts.pop();
        else parts.push(seg);
      }
      return parts.join('/');
    }

    function checkSource(source: string, node: any): void {
      if (!source.startsWith('.')) return;
      const resolved = resolveRelative(source);
      const m = resolved.match(/\/modules\/(\w+)\/(.+)/);
      if (!m) return;
      const targetModule = m[1];
      const remainder = m[2];
      if (targetModule === undefined || remainder === undefined) return;
      if (targetModule === currentModule) return;
      // Allow the module barrel: remainder is just "index" or "index.ts".
      if (/^index(\.[a-z]+)?$/.test(remainder)) return;
      // Only block imports of internal service/repository implementation files.
      const lastSeg = remainder.split('/').pop() ?? '';
      if (/\.(service|repository)(\.[a-z]+)?$/.test(lastSeg)) {
        context.report({
          node,
          messageId: 'crossModule',
          data: { target: source, other: targetModule },
        });
      }
    }

    return {
      ImportDeclaration(node: any) {
        checkSource(node.source.value as string, node);
      },
      ExportNamedDeclaration(node: any) {
        if (node.source) checkSource(node.source.value as string, node);
      },
      ExportAllDeclaration(node: any) {
        checkSource(node.source.value as string, node);
      },
    };
  },
};

export const epBoundariesPlugin = {
  meta: { name: 'ep-boundaries' },
  rules: {
    'no-cross-module-deep-imports': noCrossModuleDeepImports,
  },
};
