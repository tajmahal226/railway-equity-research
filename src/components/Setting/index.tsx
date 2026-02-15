"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { omit } from "radash";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useModel from "@/hooks/useModelList";
import { useSettingStore } from "@/store/setting";
import { researchStore } from "@/utils/storage";

import ExperimentalTab from "./tabs/ExperimentalTab";
import GeneralTab from "./tabs/GeneralTab";
import LLMTab from "./tabs/LLMTab";
import SearchTab from "./tabs/SearchTab";
import { convertModelName, formSchema, type SettingFormValues } from "./utils";

type SettingProps = {
  open: boolean;
  onClose: () => void;
};

const BUILD_MODE = process.env.NEXT_PUBLIC_BUILD_MODE;
const VERSION = process.env.NEXT_PUBLIC_VERSION;
const DISABLED_AI_PROVIDER = process.env.NEXT_PUBLIC_DISABLED_AI_PROVIDER || "";
const DISABLED_SEARCH_PROVIDER =
  process.env.NEXT_PUBLIC_DISABLED_SEARCH_PROVIDER || "";

let preLoading = false;

export default function Setting({ open, onClose }: SettingProps) {
  const { t } = useTranslation();
  const { mode, provider, searchProvider, financialProvider, update } = useSettingStore();
  const { modelList, modelTokenMap, refresh } = useModel();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      return new Promise((resolve) => {
        const state = useSettingStore.getState();
        resolve({ ...omit(state, ["update"]) });
      });
    },
  });

  const isDisabledAIProvider = useCallback(
    (providerName: string): boolean => {
      const disabledAIProviders =
        mode === "proxy" && DISABLED_AI_PROVIDER.length > 0
          ? DISABLED_AI_PROVIDER.split(",")
          : [];
      return disabledAIProviders.includes(providerName);
    },
    [mode]
  );

  const renderModelItem = useCallback(
    (name: string) => (
      <SelectItem key={name} value={name}>
        {convertModelName(name)}
        {modelTokenMap[name]
          ? ` (${modelTokenMap[name].toLocaleString()} tokens)`
          : ""}
      </SelectItem>
    ),
    [modelTokenMap]
  );

  const isDisabledSearchProvider = useCallback(
    (providerName: string): boolean => {
      const disabledSearchProviders =
        mode === "proxy" && DISABLED_SEARCH_PROVIDER.length > 0
          ? DISABLED_SEARCH_PROVIDER.split(",")
          : [];
      return disabledSearchProviders.includes(providerName);
    },
    [mode]
  );

  const handleClose = (isOpen: boolean): void => {
    if (!isOpen) onClose();
  };

  const handleSubmit = (values: SettingFormValues): void => {
    update(values);
    onClose();
  };

  const fetchModelList = useCallback(async (): Promise<void> => {
    const { provider: currentProvider } = useSettingStore.getState();
    try {
      setIsRefreshing(true);
      await refresh(currentProvider);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handleModeChange = (nextMode: string): void => {
    update({ mode: nextMode });
  };

  const handleProviderChange = async (nextProvider: string): Promise<void> => {
    update({ provider: nextProvider });
    await fetchModelList();
  };

  const handleSearchProviderChange = async (
    nextSearchProvider: string
  ): Promise<void> => {
    update({ searchProvider: nextSearchProvider });
  };

  const handleFinancialProviderChange = async (
    nextFinancialProvider: string
  ): Promise<void> => {
    update({ financialProvider: nextFinancialProvider });
  };

  const updateSetting = async (
    key: string,
    value?: string | number
  ): Promise<void> => {
    update({ [key]: value });
    await fetchModelList();
  };

  const handleReset = (): void => {
    toast.warning(t("setting.resetSetting"), {
      description: t("setting.resetSettingWarning"),
      duration: 5000,
      action: {
        label: t("setting.confirm"),
        onClick: async () => {
          const { reset } = useSettingStore.getState();
          reset();
          await researchStore.clear();
        },
      },
    });
  };

  useLayoutEffect(() => {
    if (open && !preLoading) {
      preLoading = true;
      fetchModelList();
    }
  }, [open, fetchModelList]);

  useLayoutEffect(() => {
    if (open && mode === "") {
      const { apiKey, accessPassword, update: updateSettingState } = useSettingStore.getState();
      const requestMode = !apiKey && accessPassword ? "proxy" : "local";
      updateSettingState({ mode: requestMode });
      form.setValue("mode", requestMode);
    }
  }, [open, mode, form]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-lg:max-w-md print:hidden">
        <DialogHeader>
          <DialogTitle>{t("setting.title")}</DialogTitle>
          <DialogDescription>{t("setting.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <Tabs defaultValue="llm">
              <TabsList className="w-full mb-2">
                <TabsTrigger className="flex-1" value="llm">
                  {t("setting.model")}
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="search">
                  {t("setting.search")}
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="general">
                  {t("setting.general")}
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="experimental">
                  {t("setting.experimental")}
                </TabsTrigger>
              </TabsList>

              <LLMTab
                BUILD_MODE={BUILD_MODE}
                form={form}
                t={t}
                mode={mode}
                provider={provider}
                modelList={modelList}
                isRefreshing={isRefreshing}
                isDisabledAIProvider={isDisabledAIProvider}
                handleModeChange={handleModeChange}
                handleProviderChange={handleProviderChange}
                updateSetting={updateSetting}
                fetchModelList={fetchModelList}
                renderModelItem={renderModelItem}
              />

              <SearchTab
                form={form}
                t={t}
                mode={mode}
                searchProvider={searchProvider}
                financialProvider={financialProvider}
                isDisabledSearchProvider={isDisabledSearchProvider}
                handleSearchProviderChange={handleSearchProviderChange}
                handleFinancialProviderChange={handleFinancialProviderChange}
              />

              <GeneralTab
                form={form}
                t={t}
                VERSION={VERSION}
                handleReset={handleReset}
              />

              <ExperimentalTab form={form} t={t} />
            </Tabs>
          </form>
        </Form>
        <DialogFooter className="mt-2 flex-row sm:justify-between sm:space-x-0 gap-3">
          <Button className="flex-1" variant="outline" onClick={onClose}>
            {t("setting.cancel")}
          </Button>
          <Button
            className="flex-1"
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
          >
            {t("setting.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
