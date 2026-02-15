import { getProviderModelDefaults } from "@/utils/provider";

export interface ModelConfig {
  modelId: string;
  providerId: string;
  apiKey?: string;
}

export interface BulkCompanyRequest {
  companies: string[];
  commonIndustry?: string;
  language?: string;
  thinkingModelId?: string;
  taskModelId?: string;
  thinkingProviderId?: string;
  taskProviderId?: string;
  thinkingApiKey?: string;
  taskApiKey?: string;
  searchProviderId?: string;
  searchApiKey?: string;
}

export function resolveModelConfigs(body: BulkCompanyRequest): {
  thinkingModelConfig: ModelConfig;
  taskModelConfig: ModelConfig;
} {
  const resolvedThinkingProvider = body.thinkingProviderId || body.taskProviderId || "openai";
  const resolvedTaskProvider = body.taskProviderId || body.thinkingProviderId || "openai";

  const thinkingDefaults = getProviderModelDefaults(resolvedThinkingProvider);
  const taskDefaults = getProviderModelDefaults(resolvedTaskProvider);

  const thinkingModelConfig: ModelConfig = {
    modelId: body.thinkingModelId || thinkingDefaults.thinkingModel,
    providerId: resolvedThinkingProvider,
  };

  if (body.thinkingApiKey !== undefined) {
    thinkingModelConfig.apiKey = body.thinkingApiKey;
  }

  const taskModelConfig: ModelConfig = {
    modelId: body.taskModelId || taskDefaults.taskModel,
    providerId: resolvedTaskProvider,
  };

  if (body.taskApiKey !== undefined) {
    taskModelConfig.apiKey = body.taskApiKey;
  }

  return { thinkingModelConfig, taskModelConfig };
}
