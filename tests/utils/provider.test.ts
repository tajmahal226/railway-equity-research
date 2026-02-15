import { describe, it, expect } from "vitest";
import { defaultValues, type SettingStore } from "@/store/setting";
import {
  getProviderStateKey,
  getProviderApiKey,
  resolveProviderModels,
  getProviderModelDefaults,
} from "@/utils/provider";

function cloneStore(overrides: Partial<SettingStore> = {}): SettingStore {
  return { ...defaultValues, ...overrides };
}

describe("getProviderStateKey", () => {
  it("maps special providers to state keys", () => {
    expect(getProviderStateKey("openai")).toBe("openAI");
    expect(getProviderStateKey("openrouter")).toBe("openRouter");
    expect(getProviderStateKey("xai")).toBe("xAI");
  });

  it("returns provider unchanged when mapping not needed", () => {
    expect(getProviderStateKey("anthropic")).toBe("anthropic");
    expect(getProviderStateKey("deepseek")).toBe("deepseek");
  });
});

describe("getProviderApiKey", () => {
  const store = {
    apiKey: "generic-key",
    openAIApiKey: "openai-key",
    tavilyApiKey: "tavily-key",
  };

  it("prefers provider specific keys", () => {
    expect(getProviderApiKey(store, "openai")).toBe("openai-key");
  });

  it("falls back to generic key if provider specific key missing", () => {
    expect(getProviderApiKey(store, "anthropic")).toBe("generic-key");
  });

  it("works with search providers", () => {
    expect(getProviderApiKey(store, "tavily")).toBe("tavily-key");
  });
});

describe("resolveProviderModels", () => {
  it("uses thinking model for task model when advanced routing is disabled", () => {
    const store = cloneStore({
      openAIThinkingModel: "custom-think",
      openAINetworkingModel: "custom-task",
      provider: "openai",
      advancedModelRouting: "disable",
    });

    expect(resolveProviderModels(store, "openai")).toEqual({
      thinkingModel: "custom-think",
      taskModel: "custom-think",
    });
  });

  it("keeps independent task model when advanced routing is enabled", () => {
    const store = cloneStore({
      openAIThinkingModel: "custom-think",
      openAINetworkingModel: "custom-task",
      provider: "openai",
      advancedModelRouting: "enable",
    });

    expect(resolveProviderModels(store, "openai")).toEqual({
      thinkingModel: "custom-think",
      taskModel: "custom-task",
    });
  });

  it("falls back to curated defaults for providers with empty settings", () => {
    const store = cloneStore({
      openRouterThinkingModel: "",
      openRouterNetworkingModel: "",
      provider: "openrouter",
      advancedModelRouting: "enable",
    });

    expect(resolveProviderModels(store, "openrouter")).toEqual({
      thinkingModel: "anthropic/claude-opus-4-5",
      taskModel: "anthropic/claude-sonnet-4-5",
    });
  });

  it("uses OpenAI defaults when the provider is unknown", () => {
    const store = cloneStore({ advancedModelRouting: "enable" });

    expect(resolveProviderModels(store, "unknown-provider")).toEqual(
      getProviderModelDefaults("openai"),
    );
  });
});
