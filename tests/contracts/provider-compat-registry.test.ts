import { describe, expect, it } from 'vitest';

import {
  BACKEND_AI_PROVIDERS,
  RESEARCH_AI_PROVIDERS,
  SEARCH_PROVIDERS,
  normalizeFinancialProviderId,
} from '@/constants/provider-compat';

describe('provider compatibility registry', () => {
  it('keeps the UI research AI provider set exact', () => {
    expect(RESEARCH_AI_PROVIDERS).toEqual([
      'google',
      'openai',
      'anthropic',
      'deepseek',
      'xai',
      'fireworks',
      'moonshot',
      'mistral',
      'openrouter',
      'ollama',
    ]);
  });

  it('includes backend proxy-only AI providers', () => {
    expect(BACKEND_AI_PROVIDERS).toEqual(
      expect.arrayContaining(['cohere', 'together', 'groq', 'perplexity'])
    );
  });

  it('includes bocha and searxng in search providers', () => {
    expect(SEARCH_PROVIDERS).toEqual(
      expect.arrayContaining(['bocha', 'searxng'])
    );
  });

  it('normalizes financial provider aliases to canonical values', () => {
    expect(normalizeFinancialProviderId('mock')).toBe('mock');
    expect(normalizeFinancialProviderId('MockData')).toBe('mock');

    expect(normalizeFinancialProviderId('financial-datasets')).toBe(
      'financial_datasets'
    );
    expect(normalizeFinancialProviderId('financial_datasets')).toBe(
      'financial_datasets'
    );

    expect(normalizeFinancialProviderId('alpha-vantage')).toBe('alpha_vantage');
    expect(normalizeFinancialProviderId('alpha_vantage')).toBe('alpha_vantage');

    expect(normalizeFinancialProviderId('yahoo-finance')).toBe('yahoo_finance');
    expect(normalizeFinancialProviderId('yahoo_finance')).toBe('yahoo_finance');
  });
});
