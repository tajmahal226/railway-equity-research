"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";

import HelpTip from "../HelpTip";
import type { SettingFormValues } from "../utils";

interface ExperimentalTabProps {
  form: UseFormReturn<SettingFormValues>;
  t: (key: string) => string;
}

export default function ExperimentalTab({ form, t }: ExperimentalTabProps) {
  return (
<TabsContent
  className="space-y-4 min-h-[250px]"
  value="experimental"
>
  <FormField
    control={form.control}
    name="references"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.referencesTip")}>
            {t("setting.references")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select {...field} onValueChange={field.onChange}>
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enable">
                {t("setting.enable")}
              </SelectItem>
              <SelectItem value="disable">
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
    name="citationImage"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.citationImageTip")}>
            {t("setting.citationImage")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select {...field} onValueChange={field.onChange}>
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enable">
                {t("setting.enable")}
              </SelectItem>
              <SelectItem value="disable">
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
    name="smoothTextStreamType"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.textOutputModeTip")}>
            {t("setting.textOutputMode")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select {...field} onValueChange={field.onChange}>
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="character">
                {t("setting.character")}
              </SelectItem>
              <SelectItem value="word">
                {t("setting.word")}
              </SelectItem>
              <SelectItem value="line">
                {t("setting.line")}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="onlyUseLocalResource"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.useLocalResourceTip")}>
            {t("setting.useLocalResource")}
          </HelpTip>
        </FormLabel>
        <FormControl>
          <Select {...field} onValueChange={field.onChange}>
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enable">
                {t("setting.enable")}
              </SelectItem>
              <SelectItem value="disable">
                {t("setting.disable")}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
</TabsContent>
  );
}
