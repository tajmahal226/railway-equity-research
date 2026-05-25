import { openai } from '@ai-sdk/openai';
import { smoothStream, type JSONValue, type Tool } from 'ai';
import { isNetworkingModel } from '@/utils/model';

export type ProviderOptions = Record<string, Record<string, JSONValue>>;
export type Tools = Record<string, Tool>;

interface SearchToolingInput {
  enableSearch: string;
  searchProvider: string;
  provider: string;
  model: string;
  searchMaxResult: number;
}

interface SearchModelFactoryInput {
  enableSearch: string;
  searchProvider: string;
  provider: string;
  createModelProvider: (model: string, options?: Record<string, unknown>) => Promise<any>;
}

export function getResponseLanguagePrompt(): string {
  return `\n\n**Respond in the same language as the user's language**`;
}

export function smoothTextStream(type: 'character' | 'word' | 'line') {
  return smoothStream({
    chunking: type === 'character' ? /./ : type,
    delayInMs: 0,
  });
}

export function createSearchModelFactory({
  enableSearch,
  searchProvider,
  provider,
  createModelProvider,
}: SearchModelFactoryInput) {
  return (model: string) => {
    if (
      enableSearch &&
      searchProvider === 'model' &&
      provider === 'google' &&
      isNetworkingModel(model)
    ) {
      return createModelProvider(model, { useSearchGrounding: true });
    }

    return createModelProvider(model);
  };
}

export function getSearchTools({
  enableSearch,
  searchProvider,
  provider,
  model,
}: SearchToolingInput): Tools | undefined {
  if (
    enableSearch &&
    searchProvider === 'model' &&
    provider === 'openai' &&
    model.startsWith('gpt-4o')
  ) {
    return {
      web_search_preview: openai.tools.webSearchPreview({
        searchContextSize: 'medium',
      }),
    } as unknown as Tools;
  }

  return undefined;
}

export function getSearchProviderOptions({
  enableSearch,
  searchProvider,
  provider,
  model,
  searchMaxResult,
}: SearchToolingInput): ProviderOptions | undefined {
  if (!enableSearch || searchProvider !== 'model') {
    return undefined;
  }

  if (provider === 'openrouter') {
    return {
      openrouter: {
        plugins: [
          {
            id: 'web',
            max_results: searchMaxResult,
          },
        ],
      },
    } as ProviderOptions;
  }

  if (provider === 'xai' && model.startsWith('grok-3') && !model.includes('mini')) {
    return {
      xai: {
        search_parameters: {
          mode: 'auto',
          max_search_results: searchMaxResult,
        },
      },
    } as ProviderOptions;
  }

  return undefined;
}
