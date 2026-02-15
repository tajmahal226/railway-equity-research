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
import { cn } from "@/utils/style";

import type { SettingFormValues } from "../utils";

interface ProviderApiFieldsProps {
  form: UseFormReturn<SettingFormValues>;
  provider: string;
  matchProvider: string;
  apiKeyName?: keyof SettingFormValues;
  apiProxyName: keyof SettingFormValues;
  apiProxyPlaceholder: string;
  apiKeyPlaceholder: string;
  updateSetting: (key: string, value?: string | number) => Promise<void>;
  t: (key: string) => string;
}

export default function ProviderApiFields({
  form,
  provider,
  matchProvider,
  apiKeyName,
  apiProxyName,
  apiProxyPlaceholder,
  apiKeyPlaceholder,
  updateSetting,
  t,
}: ProviderApiFieldsProps) {
  return (
    <div
      className={cn("space-y-4", {
        hidden: provider !== matchProvider,
      })}
    >
      {apiKeyName ? (
        <FormField
          control={form.control}
          name={apiKeyName}
          render={({ field }) => (
            <FormItem className="from-item">
              <FormLabel className="from-label">
                {t("setting.apiKeyLabel")}
                <span className="ml-1 text-red-500 max-sm:hidden">*</span>
              </FormLabel>
              <FormControl className="form-field">
                <Password
                  type="text"
                  placeholder={apiKeyPlaceholder}
                  {...field}
                  onBlur={() => updateSetting(String(apiKeyName), form.getValues(apiKeyName))}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ) : null}
      <FormField
        control={form.control}
        name={apiProxyName}
        render={({ field }) => (
          <FormItem className="from-item">
            <FormLabel className="from-label">{t("setting.apiUrlLabel")}</FormLabel>
            <FormControl className="form-field">
              <Input
                placeholder={apiProxyPlaceholder}
                {...field}
                onBlur={() => updateSetting(String(apiProxyName), form.getValues(apiProxyName))}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
