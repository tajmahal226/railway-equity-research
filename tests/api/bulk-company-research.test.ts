import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  resolveModelConfigs,
  type BulkCompanyRequest,
} from "@/app/api/bulk-company-research/model-config";
import { POST } from "@/app/api/bulk-company-research/route";
import { getProviderModelDefaults } from "@/utils/provider";

// Test that CompanyDeepResearch initializes search provider correctly
// for different search depths and provider IDs

describe("Bulk Company Research search provider configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    // Provide default OpenAI key for model initialization
    process.env.OPENAI_API_KEY = "test-openai-key";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const cases = [
    { providerId: "tavily", envVar: "TAVILY_API_KEY" },
    { providerId: "firecrawl", envVar: "FIRECRAWL_API_KEY" },
    { providerId: "exa", envVar: "EXA_API_KEY" },
  ];

  const depths: Array<{ depth: "medium" | "deep"; max: number }> = [
    { depth: "medium", max: 5 },
    { depth: "deep", max: 10 },
  ];

  cases.forEach(({ providerId, envVar }) => {
    depths.forEach(({ depth, max }) => {
      it(`uses ${providerId} with ${depth} search depth`, async () => {
        // Set provider-specific API key
        process.env[envVar] = `${providerId}-key`;

        const createSearchProviderMock = vi
          .fn()
          .mockResolvedValue({ sources: [], images: [] });
        const createAIProviderMock = vi.fn().mockResolvedValue({});

        vi.doMock("@/utils/deep-research/search", () => ({
          createSearchProvider: createSearchProviderMock,
        }));
        vi.doMock("@/utils/deep-research/provider", () => ({
          createAIProvider: createAIProviderMock,
          filterModelSettings: (
            _provider: string,
            _model: string,
            settings: any,
          ) => settings,
        }));

        const { CompanyDeepResearch } = await import(
          "../../src/utils/company-deep-research"
        );
        const { getSearchProviderBaseURL } = await import(
          "../../src/app/api/utils"
        );

        const researcher = new CompanyDeepResearch({
          companyName: "TestCo",
          searchDepth: depth,
          subIndustries: [],
          competitors: [],
          researchSources: [],
          language: "en-US",
          searchProviderId: providerId,
          thinkingModelConfig: { providerId: "openai", modelId: "gpt-4" },
          taskModelConfig: { providerId: "openai", modelId: "gpt-4" },
        });

        await (researcher as any).init();
        await (researcher as any).searchProvider("test query");

        expect(createSearchProviderMock).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: providerId,
            baseURL: getSearchProviderBaseURL(providerId),
            apiKey: `${providerId}-key`,
            maxResult: max,
            query: "test query",
          })
        );
      });
    });
  });
});

describe("Bulk Company Research model configuration resolution", () => {
  it("reuses the thinking provider when the task provider is missing", () => {
    const body: BulkCompanyRequest = {
      companies: ["Alpha Corp"],
      thinkingProviderId: "mistral",
    };

    const { thinkingModelConfig, taskModelConfig } = resolveModelConfigs(body);
    const defaults = getProviderModelDefaults("mistral");

    expect(thinkingModelConfig).toEqual({
      modelId: defaults.thinkingModel,
      providerId: "mistral",
    });

    expect(taskModelConfig).toEqual({
      modelId: defaults.taskModel,
      providerId: "mistral",
    });
  });

  it("reuses the task provider when the thinking provider is missing", () => {
    const body: BulkCompanyRequest = {
      companies: ["Beta Inc"],
      taskProviderId: "xai",
    };

    const { thinkingModelConfig, taskModelConfig } = resolveModelConfigs(body);
    const defaults = getProviderModelDefaults("xai");

    expect(thinkingModelConfig).toEqual({
      modelId: defaults.thinkingModel,
      providerId: "xai",
    });

    expect(taskModelConfig).toEqual({
      modelId: defaults.taskModel,
      providerId: "xai",
    });
  });

  it("preserves explicit models and API keys when provided", () => {
    const body: BulkCompanyRequest = {
      companies: ["Gamma LLC"],
      thinkingProviderId: "openai",
      thinkingModelId: "gpt-5",
      thinkingApiKey: "client-think",
      taskProviderId: "openrouter",
      taskModelId: "anthropic/claude-3.5-sonnet",
      taskApiKey: "",
    };

    const { thinkingModelConfig, taskModelConfig } = resolveModelConfigs(body);

    expect(thinkingModelConfig).toEqual({
      modelId: "gpt-5",
      providerId: "openai",
      apiKey: "client-think",
    });

    expect(taskModelConfig).toEqual({
      modelId: "anthropic/claude-3.5-sonnet",
      providerId: "openrouter",
      apiKey: "",
    });
  });

  it("defaults both providers to OpenAI when none are provided", () => {
    const body: BulkCompanyRequest = {
      companies: ["Delta Co"],
    };

    const { thinkingModelConfig, taskModelConfig } = resolveModelConfigs(body);
    const defaults = getProviderModelDefaults("openai");

    expect(thinkingModelConfig).toEqual({
      modelId: defaults.thinkingModel,
      providerId: "openai",
    });

    expect(taskModelConfig).toEqual({
      modelId: defaults.taskModel,
      providerId: "openai",
    });
  });

  it("uses shared provider defaults across the broader provider set", () => {
    const providers = [
      "anthropic",
      "deepseek",
      "mistral",
      "xai",
      "google",
      "openrouter",
      "openai",
      "fireworks",
      "moonshot",
      "cohere",
      "together",
      "groq",
      "perplexity",
      "ollama",
    ];

    for (const providerId of providers) {
      const body: BulkCompanyRequest = {
        companies: ["Provider Default Co"],
        thinkingProviderId: providerId,
      };

      const { thinkingModelConfig, taskModelConfig } = resolveModelConfigs(body);
      const defaults = getProviderModelDefaults(providerId);

      expect(thinkingModelConfig).toEqual({
        modelId: defaults.thinkingModel,
        providerId,
      });

      expect(taskModelConfig).toEqual({
        modelId: defaults.taskModel,
        providerId,
      });
    }
  });
});

describe("POST /api/bulk-company-research provider validation", () => {
  const createRequest = (payload: Record<string, unknown>) =>
    new NextRequest("http://localhost/api/bulk-company-research", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

  it("returns 400 for unsupported thinkingProviderId", async () => {
    const response = await POST(
      createRequest({
        companies: ["Acme"],
        thinkingProviderId: "unsupported-provider",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain(
      'Unsupported thinkingProviderId "unsupported-provider".'
    );
  });

  it("returns 400 for unsupported taskProviderId", async () => {
    const response = await POST(
      createRequest({
        companies: ["Acme"],
        taskProviderId: "unsupported-provider",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain(
      'Unsupported taskProviderId "unsupported-provider".'
    );
  });

  it("returns 400 for unsupported searchProviderId", async () => {
    const response = await POST(
      createRequest({
        companies: ["Acme"],
        searchProviderId: "unsupported-search",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain(
      'Unsupported searchProviderId "unsupported-search".'
    );
  });
});
