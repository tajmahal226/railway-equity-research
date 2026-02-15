import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('search route coverage', () => {
  it('has route modules for all supported search providers', () => {
    const routePaths = [
      'src/app/api/search/tavily/[...slug]/route.ts',
      'src/app/api/search/firecrawl/[...slug]/route.ts',
      'src/app/api/search/exa/[...slug]/route.ts',
      'src/app/api/search/bocha/[...slug]/route.ts',
      'src/app/api/search/searxng/[...slug]/route.ts',
    ];

    for (const routePath of routePaths) {
      expect(existsSync(join(process.cwd(), routePath))).toBe(true);
    }
  });
});
