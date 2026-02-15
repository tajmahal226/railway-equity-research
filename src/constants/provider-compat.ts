export const RESEARCH_AI_PROVIDERS = [
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
] as const;

export const BACKEND_AI_PROVIDERS = [
  ...RESEARCH_AI_PROVIDERS,
  'cohere',
  'together',
  'groq',
  'perplexity',
] as const;

export const SEARCH_PROVIDERS = [
  'model',
  'tavily',
  'firecrawl',
  'exa',
  'bocha',
  'searxng',
] as const;

export type ResearchAIProvider = (typeof RESEARCH_AI_PROVIDERS)[number];
export type BackendAIProvider = (typeof BACKEND_AI_PROVIDERS)[number];
export type SearchProvider = (typeof SEARCH_PROVIDERS)[number];

export type FinancialProviderId =
  | 'mock'
  | 'auto'
  | 'financial_datasets'
  | 'alpha_vantage'
  | 'yahoo_finance';

const RESEARCH_AI_PROVIDER_SET = new Set<string>(RESEARCH_AI_PROVIDERS);
const BACKEND_AI_PROVIDER_SET = new Set<string>(BACKEND_AI_PROVIDERS);
const SEARCH_PROVIDER_SET = new Set<string>(SEARCH_PROVIDERS);

function normalizeProviderToken(value: string | undefined | null): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isResearchAIProvider(provider: string | undefined | null): boolean {
  return RESEARCH_AI_PROVIDER_SET.has(normalizeProviderToken(provider));
}

export function isBackendAIProvider(provider: string | undefined | null): boolean {
  return BACKEND_AI_PROVIDER_SET.has(normalizeProviderToken(provider));
}

export function isSearchProvider(provider: string | undefined | null): boolean {
  return SEARCH_PROVIDER_SET.has(normalizeProviderToken(provider));
}

export function getSearchProvidersForMode(mode: 'local' | 'proxy'): string[] {
  return [...SEARCH_PROVIDERS];
}

export function normalizeFinancialProviderId(value?: string): FinancialProviderId {
  if (!value) {
    return 'mock';
  }

  const normalized = value.trim().toLowerCase();
  const compact = normalized.replace(/[\s_-]+/g, '');

  if (compact.includes('mock')) {
    return 'mock';
  }

  if (compact === 'default' || compact.includes('auto')) {
    return 'auto';
  }

  if (compact.includes('financial')) {
    return 'financial_datasets';
  }

  if (compact.includes('alpha')) {
    return 'alpha_vantage';
  }

  if (compact.includes('yahoo')) {
    return 'yahoo_finance';
  }

  return 'auto';
}
