"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import locales from "@/constants/locales";

import HelpTip from "../HelpTip";
import type { SettingFormValues } from "../utils";

interface GeneralTabProps {
  form: UseFormReturn<SettingFormValues>;
  t: (key: string) => string;
  VERSION: string | undefined;
  handleReset: () => void;
}

export default function GeneralTab({ form, t, VERSION, handleReset }: GeneralTabProps) {
  return (
<TabsContent className="space-y-4 min-h-[250px]" value="general">
  <FormField
    control={form.control}
    name="language"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.languageTip")}>
            {t("setting.language")}
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
              {Object.entries(locales).map(([code, name]) => {
                return (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="theme"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">{t("theme")}</FormLabel>
        <FormControl>
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger className="form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                {t("setting.system")}
              </SelectItem>
              <SelectItem value="light">
                {t("setting.light")}
              </SelectItem>
              <SelectItem value="dark">
                {t("setting.dark")}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="debug"
    render={({ field }) => (
      <FormItem className="from-item">
        <FormLabel className="from-label">
          <HelpTip tip={t("setting.debugTip")}>
            {t("setting.debug")}
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
  <div className="from-item">
    <Label className="from-label">{t("setting.version")}</Label>
    <div className="form-field text-center leading-9">
      {`v${VERSION}`}
      <small className="ml-1">
        (
        <a
          className="hover:underline hover:underline-offset-4 hover:text-blue-500"
          href="https://github.com/tajmahal226"
          target="_blank"
        >
          {t("setting.checkForUpdate")}
        </a>
        )
      </small>
    </div>
  </div>
  <div className="from-item">
    <Label className="from-label">
      {t("setting.resetSetting")}
    </Label>
    <Button
      className="form-field hover:text-red-500"
      type="button"
      variant="ghost"
      onClick={() => handleReset()}
    >
      {t("setting.resetAllSettings")}
    </Button>
  </div>
</TabsContent>
  );
}
