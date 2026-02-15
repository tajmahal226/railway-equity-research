"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { RefreshCw } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/style";

import HelpTip from "../HelpTip";
import type { SettingFormValues } from "../utils";

interface ModelSelectFieldProps {
  form: UseFormReturn<SettingFormValues>;
  name: keyof SettingFormValues;
  tip: string;
  label: string;
  modelList: string[];
  renderModelItem: (name: string) => ReactNode;
  isRefreshing: boolean;
  fetchModelList: () => Promise<void>;
  t: (key: string) => string;
  useRecommendedGroup?: boolean;
}

export default function ModelSelectField({
  form,
  name,
  tip,
  label,
  modelList,
  renderModelItem,
  isRefreshing,
  fetchModelList,
  t,
  useRecommendedGroup = false,
}: ModelSelectFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="from-item">
          <FormLabel className="from-label">
            <HelpTip tip={tip}>
              {label}
              <span className="ml-1 text-red-500 max-sm:hidden">*</span>
            </HelpTip>
          </FormLabel>
          <FormControl>
            <div className="form-field w-full">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn({
                    hidden: modelList.length === 0,
                  })}
                >
                  <SelectValue
                    placeholder={t("setting.modelListLoadingPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent className="max-sm:max-h-72">
                  {useRecommendedGroup && modelList.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>{t("setting.recommendedModels")}</SelectLabel>
                      {modelList.map(renderModelItem)}
                    </SelectGroup>
                  ) : (
                    modelList.map(renderModelItem)
                  )}
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
                    <RefreshCw className="animate-spin" /> {t("setting.modelListLoading")}
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
  );
}
