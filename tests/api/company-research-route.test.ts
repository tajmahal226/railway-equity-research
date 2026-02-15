import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/company-research/route';

describe('POST /api/company-research provider validation', () => {
  const createRequest = (payload: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/company-research', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

  const requiredBody = {
    companyName: 'Acme',
    searchDepth: 'fast',
  } as const;

  it('returns 400 for unsupported thinkingProviderId', async () => {
    const response = await POST(
      createRequest({
        ...requiredBody,
        thinkingProviderId: 'unsupported-provider',
      })
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain(
      'Unsupported thinkingProviderId "unsupported-provider".'
    );
  });

  it('returns 400 for unsupported taskProviderId', async () => {
    const response = await POST(
      createRequest({
        ...requiredBody,
        taskProviderId: 'unsupported-provider',
      })
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain(
      'Unsupported taskProviderId "unsupported-provider".'
    );
  });

  it('returns 400 for unsupported searchProviderId', async () => {
    const response = await POST(
      createRequest({
        ...requiredBody,
        searchProviderId: 'unsupported-search',
      })
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain(
      'Unsupported searchProviderId "unsupported-search".'
    );
  });
});
