"use client";

import type { UseFormReturn } from "react-hook-form";

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import {
  BOCHA_BASE_URL,
  EXA_BASE_URL,
  FIRECRAWL_BASE_URL,
  SEARXNG_BASE_URL,
  TAVILY_BASE_URL,
} from "@/constants/urls";
import { getSearchProvidersForMode } from "@/constants/provider-compat";
import { cn } from "@/utils/style";

import HelpTip from "../HelpTip";
import type { SettingFormValues } from "../utils";

interface SearchTabProps {
  form: UseFormReturn<SettingFormValues>;
  t: (key: string) => string;
  mode: string;
  searchProvider: string;
  financialProvider: string;
  isDisabledSearchProvider: (provider: string) => boolean;
  handleSearchProviderChange: (searchProvider: string) => Promise<void>;
  handleFinancialProviderChange: (financialProvider: string) => Promise<void>;
}

export default function SearchTab({
  form,
  t,
  mode,
  searchProvider,
  financialProvider,
  isDisabledSearchProvider,
  handleSearchProviderChange,
  handleFinancialProviderChange,
}: SearchTabProps) {
  const availableSearchProviders = getSearchProvidersForMode(
    mode === "proxy" ? "proxy" : "local"
  );

  const canSelectProvider = (providerId: string): boolean => {
    return (
      availableSearchProviders.includes(providerId) &&
      !isDisabledSearchProvider(providerId)
    );
  };

  return (
<TabsContent className="space-y-4  min-h-[250px]" value="search">
  <FormField
    control={form.control}
    name="enableSearch"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.webSearchTip")}>
            {t("setting.webSearch")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">
                {t("setting.enable")}
              </SelectItem>
              <SelectItem value="0">
                {t("setting.disable")}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="searchProvider"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.searchProviderTip")}>
            {t("setting.searchProvider")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select
            value={field.value}
            disabled={form.getValues("enableSearch") === "0"}
            onValueChange={(value) => {
              field.onChange(value);
              handleSearchProviderChange(value);
            }}
          >
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="model">
                {t("setting.modelBuiltin")}
              </SelectItem>
              {canSelectProvider("tavily") ? (
                <SelectItem value="tavily">Tavily</SelectItem>
              ) : null}
              {canSelectProvider("firecrawl") ? (
                <SelectItem value="firecrawl">
                  Firecrawl
                </SelectItem>
              ) : null}
              {canSelectProvider("exa") ? (
                <SelectItem value="exa">Exa</SelectItem>
              ) : null}
              {canSelectProvider("bocha") ? (
                <SelectItem value="bocha">
                  {t("setting.bocha")}
                </SelectItem>
              ) : null}
              {canSelectProvider("searxng") ? (
                <SelectItem value="searxng">SearXNG</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
  <div className={mode === "proxy" ? "hidden" : ""}>
    <div
      className={cn("space-y-4", {
        hidden: searchProvider !== "tavily",
      })}
    >
      <FormField
        control={form.control}
        name="tavilyApiKey"
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
                placeholder={t("setting.searchApiKeyPlaceholder")}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tavilyApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={TAVILY_BASE_URL}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tavilyScope"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.searchScope")}
            </FormLabel>
            <FormControl className="form-field">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="form-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    {t("setting.scopeValue.general")}
                  </SelectItem>
                  <SelectItem value="news">
                    {t("setting.scopeValue.news")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: searchProvider !== "firecrawl",
      })}
    >
      <FormField
        control={form.control}
        name="firecrawlApiKey"
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
                placeholder={t("setting.searchApiKeyPlaceholder")}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="firecrawlApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={FIRECRAWL_BASE_URL}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: searchProvider !== "exa",
      })}
    >
      <FormField
        control={form.control}
        name="exaApiKey"
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
                placeholder={t("setting.searchApiKeyPlaceholder")}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="exaApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={EXA_BASE_URL}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="exaScope"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.searchScope")}
            </FormLabel>
            <FormControl className="form-field">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="form-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="research paper">
                    {t("setting.scopeValue.researchPaper")}
                  </SelectItem>
                  <SelectItem value="financial">
                    {t("setting.scopeValue.financial")}
                  </SelectItem>
                  <SelectItem value="news">
                    {t("setting.scopeValue.news")}
                  </SelectItem>
                  <SelectItem value="company">
                    {t("setting.scopeValue.company")}
                  </SelectItem>
                  <SelectItem value="personal site">
                    {t("setting.scopeValue.personalSite")}
                  </SelectItem>
                  <SelectItem value="github">
                    {t("setting.scopeValue.github")}
                  </SelectItem>
                  <SelectItem value="linkedin">
                    {t("setting.scopeValue.linkedin")}
                  </SelectItem>
                  <SelectItem value="pdf">
                    {t("setting.scopeValue.pdf")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: searchProvider !== "bocha",
      })}
    >
      <FormField
        control={form.control}
        name="bochaApiKey"
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
                placeholder={t("setting.searchApiKeyPlaceholder")}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bochaApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={BOCHA_BASE_URL}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    <div
      className={cn("space-y-4", {
        hidden: searchProvider !== "searxng",
      })}
    >
      <FormField
        control={form.control}
        name="searxngApiProxy"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.apiUrlLabel")}
            </FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={SEARXNG_BASE_URL}
                disabled={form.getValues("enableSearch") === "0"}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="searxngScope"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              {t("setting.searchScope")}
            </FormLabel>
            <FormControl className="form-field">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="form-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("setting.scopeValue.all")}
                  </SelectItem>
                  <SelectItem value="academic">
                    {t("setting.scopeValue.academic")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  </div>
  
  {/* Financial Data Provider Settings */}
  <div className="border-t pt-6">
    <h3 className="text-lg font-medium mb-4">Financial Data Provider</h3>
    <FormField
      control={form.control}
      name="financialProvider"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Choose your financial data source. Mock data is free but not real-time. API providers require your own API key but provide real market data.">
              Financial Provider
            </HelpTip>
          </FormLabel>
          <FormControl>
            <Select
              value={field.value || "mock"}
              onValueChange={(value) => {
                field.onChange(value);
                handleFinancialProviderChange(value);
              }}
            >
              <SelectTrigger className="form-field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mock">Mock Data (Free)</SelectItem>
                <SelectItem value="financial-datasets">Financial Datasets (Recommended)</SelectItem>
                <SelectItem value="alpha-vantage">Alpha Vantage</SelectItem>
                <SelectItem value="yahoo-finance">Yahoo Finance (Free)</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
    
    <div className={cn("space-y-4 mt-4", {
      hidden: financialProvider !== "alpha-vantage",
    })}>
      <FormField
        control={form.control}
        name="alphaVantageApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              <HelpTip tip="Get your free API key from https://www.alphavantage.co/support/#api-key">
                Alpha Vantage API Key
              </HelpTip>
            </FormLabel>
            <FormControl>
              <Password
                placeholder="Enter Alpha Vantage API Key"
                className="form-field"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    
    <div className={cn("space-y-4 mt-4", {
      hidden: financialProvider !== "yahoo-finance",
    })}>
      <FormField
        control={form.control}
        name="yahooFinanceApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              <HelpTip tip="Yahoo Finance API key from RapidAPI or similar providers">
                Yahoo Finance API Key
              </HelpTip>
            </FormLabel>
            <FormControl>
              <Password
                placeholder="Enter Yahoo Finance API Key"
                className="form-field"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
    
    <div className={cn("space-y-4 mt-4", {
      hidden: financialProvider !== "financial-datasets",
    })}>
      <FormField
        control={form.control}
        name="financialDatasetsApiKey"
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">
              <HelpTip tip="Get your API key from https://financialdatasets.ai/. Provides comprehensive financial data including real-time prices, financials, and company profiles.">
                Financial Datasets API Key
              </HelpTip>
            </FormLabel>
            <FormControl>
              <Password
                placeholder="Enter Financial Datasets API Key"
                className="form-field"
                {...field}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground mt-1">
              Professional-grade financial data API with comprehensive coverage and real-time updates.
            </p>
          </FormItem>
        )}
      />
    </div>
  </div>

  {/* Enhanced Search - Exa Neural Search */}
  <div className="border-t pt-6">
    <h3 className="text-lg font-medium mb-4">Enhanced Search - Exa Neural Search</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Enable high-quality, authoritative content search powered by Exa&apos;s neural search engine. Perfect for finding research papers, financial documents, and expert analysis.
    </p>
    <FormField
      control={form.control}
      name="exaNeuralSearchApiKey"
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip="Get your API key from https://dashboard.exa.ai/api-keys. Provides access to neural search for high-quality, authoritative content discovery.">
              Exa API Key (Optional)
            </HelpTip>
          </FormLabel>
          <FormControl>
            <Password
              placeholder="Enter Exa API Key for enhanced search quality"
              className="form-field"
              {...field}
            />
          </FormControl>
          <p className="text-xs text-muted-foreground mt-1">
            Optional: Leave blank to use mock high-quality results. Provide API key for real neural search results.
          </p>
        </FormItem>
      )}
    />
  </div>

  <FormField
    control={form.control}
    name="parallelSearch"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.parallelSearchTip")}>
            {t("setting.parallelSearch")}
          </HelpTip>
        </FormLabel>
        <FormControl className="form-field">
          <div className="flex h-9">
            <Slider
              className="flex-1"
              value={[field.value]}
              max={5}
              min={1}
              step={1}
              disabled={form.getValues("enableSearch") === "0"}
              onValueChange={(values) =>
                field.onChange(values[0])
              }
            />
            <span className="w-[14%] text-center text-sm leading-10">
              {field.value}
            </span>
          </div>
        </FormControl>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="searchMaxResult"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.searchResultsTip")}>
            {t("setting.searchResults")}
          </HelpTip>
        </FormLabel>
        <FormControl className="form-field">
          <div className="flex h-9">
            <Slider
              className="flex-1"
              value={[field.value]}
              max={10}
              min={1}
              step={1}
              disabled={form.getValues("enableSearch") === "0"}
              onValueChange={(values) =>
                field.onChange(values[0])
              }
            />
            <span className="w-[14%] text-center text-sm leading-10">
              {field.value}
            </span>
          </div>
        </FormControl>
      </FormItem>
    )}
  />
</TabsContent>
  );
}
