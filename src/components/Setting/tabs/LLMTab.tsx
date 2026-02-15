"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { RefreshCw } from "lucide-react";

import { Password } from "@/components/Internal/PasswordInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ANTHROPIC_BASE_URL,
  DEEPSEEK_BASE_URL,
  FIREWORKS_BASE_URL,
  GEMINI_BASE_URL,
  MISTRAL_BASE_URL,
  MOONSHOT_BASE_URL,
  OLLAMA_BASE_URL,
  OPENAI_BASE_URL,
  OPENROUTER_BASE_URL,
  XAI_BASE_URL,
} from "@/constants/urls";
import { getProviderStateKey } from "@/utils/provider";
import { cn } from "@/utils/style";

import HelpTip from "../HelpTip";
import ProviderApiFields from "../fields/ProviderApiFields";
import type { SettingFormValues } from "../utils";

interface LLMTabProps {
  BUILD_MODE: string | undefined;
  form: UseFormReturn<SettingFormValues>;
  t: (key: string) => string;
  mode: string;
  provider: string;
  modelList: string[];
  isRefreshing: boolean;
  isDisabledAIProvider: (provider: string) => boolean;
  handleModeChange: (mode: string) => void;
  handleProviderChange: (provider: string) => Promise<void>;
  updateSetting: (key: string, value?: string | number) => Promise<void>;
  fetchModelList: () => Promise<void>;
  renderModelItem: (name: string) => ReactNode;
}

export default function LLMTab({
  BUILD_MODE,
  form,
  t,
  mode,
  provider,
  modelList,
  isRefreshing,
  isDisabledAIProvider,
  handleModeChange,
  handleProviderChange,
  updateSetting,
  fetchModelList,
  renderModelItem,
}: LLMTabProps) {
  const isAdvancedModelRouting = form.watch("advancedModelRouting") === "enable";

  const syncTaskModelValues = (): void => {
    const providerThinkingToTaskFieldMap = [
      ["thinkingModel", "networkingModel"],
      ["openRouterThinkingModel", "openRouterNetworkingModel"],
      ["openAIThinkingModel", "openAINetworkingModel"],
      ["anthropicThinkingModel", "anthropicNetworkingModel"],
      ["deepseekThinkingModel", "deepseekNetworkingModel"],
      ["xAIThinkingModel", "xAINetworkingModel"],
      ["fireworksThinkingModel", "fireworksNetworkingModel"],
      ["moonshotThinkingModel", "moonshotNetworkingModel"],
      ["mistralThinkingModel", "mistralNetworkingModel"],
      ["ollamaThinkingModel", "ollamaNetworkingModel"],
    ] as const satisfies ReadonlyArray<readonly [keyof SettingFormValues, keyof SettingFormValues]>;

    for (const [thinkingField, taskField] of providerThinkingToTaskFieldMap) {
      const thinkingValue = form.getValues(thinkingField);
      form.setValue(taskField, thinkingValue ?? "", {
        shouldDirty: true,
      });
    }

    const providerStateKey = getProviderStateKey(provider);
    const activeThinkingField =
      provider === "google"
        ? "thinkingModel"
        : (`${providerStateKey}ThinkingModel` as keyof SettingFormValues);
    const activeTaskField =
      provider === "google"
        ? "networkingModel"
        : (`${providerStateKey}NetworkingModel` as keyof SettingFormValues);
    const activeThinkingValue = form.getValues(activeThinkingField);

    form.setValue(activeTaskField, activeThinkingValue ?? "", {
      shouldDirty: true,
    });
  };

  return (
<TabsContent className="space-y-4  min-h-[250px]" value="llm">
  <div className={BUILD_MODE === "export" ? "hidden" : ""}>
    <FormField
      control={form.control}
      name="mode"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.modeTip")}>
              {t("setting.mode")}
            </HelpTip>
          </FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                handleModeChange(value);
              }}
            >
              <SelectTrigger className="form-field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-sm:max-h-48">
                <SelectItem value="local">
                  {t("setting.local")}
                </SelectItem>
                <SelectItem value="proxy">
                  {t("setting.proxy")}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <FormField
    control={form.control}
    name="provider"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.providerTip")}>
            {t("setting.provider")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              handleProviderChange(value);
            }}
          >
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-sm:max-h-72">
              {!isDisabledAIProvider("google") ? (
                <SelectItem value="google">
                  Google AI Studio
                </SelectItem>
              ) : null}
              {!isDisabledAIProvider("openai") ? (
                <SelectItem value="openai">OpenAI</SelectItem>
              ) : null}
              {!isDisabledAIProvider("anthropic") ? (
                <SelectItem value="anthropic">
                  Anthropic
                </SelectItem>
              ) : null}
              {!isDisabledAIProvider("deepseek") ? (
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              ) : null}
              {!isDisabledAIProvider("xai") ? (
                <SelectItem value="xai">xAI Grok</SelectItem>
              ) : null}
              {!isDisabledAIProvider("fireworks") ? (
                <SelectItem value="fireworks">Fireworks</SelectItem>
              ) : null}
              {!isDisabledAIProvider("moonshot") ? (
                <SelectItem value="moonshot">Moonshot (Kimi)</SelectItem>
              ) : null}
              {!isDisabledAIProvider("mistral") ? (
                <SelectItem value="mistral">Mistral</SelectItem>
              ) : null}
              {!isDisabledAIProvider("openrouter") ? (
                <SelectItem value="openrouter">
                  OpenRouter
                </SelectItem>
              ) : null}
              {!isDisabledAIProvider("ollama") ? (
                <SelectItem value="ollama">Ollama</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="advancedModelRouting"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.advancedModelRoutingTip")}>
            {t("setting.advancedModelRouting")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              updateSetting("advancedModelRouting", value);

              if (value === "disable") {
                syncTaskModelValues();
              }
            }}
          >
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enable">{t("setting.enable")}</SelectItem>
              <SelectItem value="disable">{t("setting.disable")}</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
  <div className={mode === "proxy" ? "hidden" : ""}>
    <ProviderApiFields
      form={form}
      provider={provider}
      matchProvider="google"
      apiKeyName="apiKey"
      apiProxyName="apiProxy"
      apiProxyPlaceholder={GEMINI_BASE_URL}
      apiKeyPlaceholder={t("setting.apiKeyPlaceholder")}
      updateSetting={updateSetting}
      t={t}
    />
    <div
      className={cn("space-y-4", {
        hidden: provider !== "openrouter",
      })}
    >
      <FormField
        control={form.control}
        name="openRouterApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "openRouterApiKey",
                    form.getValues("openRouterApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="openRouterApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={OPENROUTER_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "openRouterApiProxy",
                    form.getValues("openRouterApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "openai",
      })}
    >
      <FormField
        control={form.control}
        name="openAIApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "openAIApiKey",
                    form.getValues("openAIApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="openAIApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={OPENAI_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "openAIApiProxy",
                    form.getValues("openAIApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "anthropic",
      })}
    >
      <FormField
        control={form.control}
        name="anthropicApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "anthropicApiKey",
                    form.getValues("anthropicApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="anthropicApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={ANTHROPIC_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "anthropicApiProxy",
                    form.getValues("anthropicApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "deepseek",
      })}
    >
      <FormField
        control={form.control}
        name="deepseekApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "deepseekApiKey",
                    form.getValues("deepseekApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="deepseekApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={DEEPSEEK_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "deepseekApiProxy",
                    form.getValues("deepseekApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "xai",
      })}
    >
      <FormField
        control={form.control}
        name="xAIApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "xAIApiKey",
                    form.getValues("xAIApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="xAIApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={XAI_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "xAIApiProxy",
                    form.getValues("xAIApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "fireworks",
      })}
    >
      <FormField
        control={form.control}
        name="fireworksApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "fireworksApiKey",
                    form.getValues("fireworksApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="fireworksApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={`${FIREWORKS_BASE_URL}/inference`}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "fireworksApiProxy",
                    form.getValues("fireworksApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "moonshot",
      })}
    >
      <FormField
        control={form.control}
        name="moonshotApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "moonshotApiKey",
                    form.getValues("moonshotApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="moonshotApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={MOONSHOT_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "moonshotApiProxy",
                    form.getValues("moonshotApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "mistral",
      })}
    >
      <FormField
        control={form.control}
        name="mistralApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiKeyLabel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </FormLabel>
            <FormControl className="form-field">
              <Password
                type="text"
                placeholder={t("setting.apiKeyPlaceholder")}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "mistralApiKey",
                    form.getValues("mistralApiKey")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="mistralApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={MISTRAL_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "mistralApiProxy",
                    form.getValues("mistralApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: provider !== "ollama",
      })}
    >
      <FormField
        control={form.control}
        name="ollamaApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={OLLAMA_BASE_URL}
                {...field}
                onBlur={() =>
                  updateSetting(
                    "ollamaApiProxy",
                    form.getValues("ollamaApiProxy")
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  </div>
  <div
    className={cn("space-y-4", {
      hidden: mode === "local" || BUILD_MODE === "export",
    })}
  >
    <FormField
      control={form.control}
      name="accessPassword"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.accessPasswordTip")}>
              {t("setting.accessPassword")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl className="form-field">
            <Password
              type="text"
              placeholder={t("setting.accessPasswordPlaceholder")}
              {...field}
              onBlur={() =>
                updateSetting(
                  "accessPassword",
                  form.getValues("accessPassword")
                )
              }
            />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "google",
    })}
  >
    <FormField
      control={form.control}
      name="thinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.map(renderModelItem)}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="networkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.map(renderModelItem)}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "openrouter",
    })}
  >
    <FormField
      control={form.control}
      name="openRouterThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="openRouterNetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "openai",
    })}
  >
    <FormField
      control={form.control}
      name="openAIThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="openAINetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="openAIReasoningEffort"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Adjust the reasoning effort for o1 and advanced GPT-5 models. Higher effort may provide better results but takes more time.">
              Reasoning Effort
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateSetting("openAIReasoningEffort", value);
                }}
                disabled={true}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reasoning effort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Faster response</SelectItem>
                  <SelectItem value="medium">Medium - Balanced</SelectItem>
                  <SelectItem value="high">High - Best quality</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Reasoning effort is only available for o1 and advanced GPT-5 models
              </p>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "anthropic",
    })}
  >
    <FormField
      control={form.control}
      name="anthropicThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.map(renderModelItem)}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="anthropicNetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.map(renderModelItem)}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.0) make it more creative. Note: Anthropic models support temperature range 0-1">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (1)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "deepseek",
    })}
  >
    <FormField
      control={form.control}
      name="deepseekThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="deepseekNetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "xai",
    })}
  >
    <FormField
      control={form.control}
      name="xAIThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.map(renderModelItem)}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="xAINetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.map(renderModelItem)}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "fireworks",
    })}
  >
    <FormField
      control={form.control}
      name="fireworksThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="fireworksNetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "moonshot",
    })}
  >
    <FormField
      control={form.control}
      name="moonshotThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="moonshotNetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  <div
    className={cn("space-y-4", {
      hidden: provider !== "mistral",
    })}
  >
    <FormField
      control={form.control}
      name="mistralThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="mistralNetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t(
                      "setting.modelListLoadingPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>
                        {t("setting.recommendedModels")}
                      </SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                className={cn("w-full", {
                  hidden: modelList.length > 0,
                })}
                type="button"
                variant="outline"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" />{" "}
                    {t("setting.modelListLoading")}
                  </>
                ) : (
                  <>
                    <RefreshCw /> {t("setting.refresh")}
                  </>
                )}
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.0) make it more creative. Note: Mistral models support temperature range 0-1">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (1)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
  
  <div
    className={cn("space-y-4", {
      hidden: provider !== "ollama",
    })}
  >
    <FormField
      control={form.control}
      name="ollamaThinkingModel"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.thinkingModelTip")}>
              {t("setting.thinkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field flex gap-2">
              <Input
                className={cn("flex-1", {
                  hidden: modelList.length > 0,
                })}
                placeholder={t("setting.modelListPlaceholder")}
                {...field}
              />
              <div
                className={cn("flex-1", {
                  hidden: modelList.length === 0,
                })}
              >
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "setting.modelListLoadingPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-sm:max-h-72">
                    {modelList.map(renderModelItem)}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                <RefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="ollamaNetworkingModel"
      render={({ field }) => (
        <FormItem
          className={cn("from-item", {
            hidden: !isAdvancedModelRouting,
          })}
        >
          <FormLabel className="from-label">
            <HelpTip tip={t("setting.networkingModelTip")}>
              {t("setting.networkingModel")}
              <span className="ml-1 text-red-500 max-sm:hidden">
                *
              </span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full flex gap-2">
              <Input
                className={cn("flex-1", {
                  hidden: modelList.length > 0,
                })}
                placeholder={t("setting.modelListPlaceholder")}
                {...field}
              />
              <div
                className={cn("flex-1", {
                  hidden: modelList.length === 0,
                })}
              >
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "setting.modelListLoadingPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-sm:max-h-72">
                    {modelList.map(renderModelItem)}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isRefreshing}
                onClick={() => fetchModelList()}
              >
                <RefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Controls randomness in responses. Lower values (0.1) make output more focused and deterministic, higher values (1.5) make it more creative and random. Range: 0-2, recommended: 0.7">
              Temperature
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <div className="space-y-2">
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    updateSetting("temperature", value[0]);
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More focused (0)</span>
                  <span className="font-medium">{(field.value || 0.7).toFixed(1)}</span>
                  <span>More creative (2)</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  </div>
</TabsContent>
  );
}
