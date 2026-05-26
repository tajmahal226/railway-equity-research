import { useState, useCallback } from "react";
import { streamText } from "ai";
import { parsePartialJson } from 'ai';
import { useTranslation } from "react-i18next";
import Plimit from "p-limit";
import useModelProvider from "@/hooks/useAiProvider";
import useWebSearch from "@/hooks/useWebSearch";
import { useTaskStore } from "@/store/task";
import { useHistoryStore } from "@/store/history";
import { useSettingStore } from "@/store/setting";
import { useKnowledgeStore } from "@/store/knowledge";
import { outputGuidelinesPrompt } from "@/constants/prompts";
import {
  getSystemPrompt,
  generateQuestionsPrompt,
  writeReportPlanPrompt,
  generateSerpQueriesPrompt,
  processResultPrompt,
  processSearchResultPrompt,
  processSearchKnowledgeResultPrompt,
  reviewSerpQueriesPrompt,
  writeFinalReportPrompt,
  getSERPQuerySchema,
} from "@/utils/deep-research/prompts";
import { ThinkTagStreamProcessor, removeJsonMarkdown } from "@/utils/text";
import { handleError } from "@/utils/error";
import { pick, flat, unique } from "radash";
import { logger } from "@/utils/logger";
import {
  createSearchModelFactory,
  getResponseLanguagePrompt,
  getSearchProviderOptions,
  getSearchTools,
  smoothTextStream,
} from "@/hooks/deep-research/helpers";

function useDeepResearch() {
  const { t } = useTranslation();
  // Removed direct useTaskStore() subscription to prevent re-renders on every store update
  const { smoothTextStreamType } = useSettingStore();
  const { createModelProvider, getModel } = useModelProvider();
  const { search } = useWebSearch();
  const [status, setStatus] = useState<string>("");

  const askQuestions = useCallback(async () => {
    const { question, setQuestion, updateQuestions } = useTaskStore.getState();
    const { thinkingModel } = getModel();
    setStatus(t("research.common.thinking"));
    const thinkTagStreamProcessor = new ThinkTagStreamProcessor();
    const result = streamText({
      model: await createModelProvider(thinkingModel),
      system: getSystemPrompt(),
      prompt: [
        generateQuestionsPrompt(question),
        getResponseLanguagePrompt(),
      ].join("\n\n"),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: (error) => handleError(error),
    });
    let content = "";
    let reasoning = "";
    setQuestion(question);
    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        thinkTagStreamProcessor.processChunk(
          part.text,
          (data) => {
            content += data;
            updateQuestions(content);
          },
          (data) => {
            reasoning += data;
          }
        );
      } else if (part.type === "reasoning-delta") {
        reasoning += part.text;
      }
    }
    if (reasoning) logger.log(reasoning);
  }, [createModelProvider, getModel, smoothTextStreamType, t]);

  const writeReportPlan = useCallback(async () => {
    const { query, updateReportPlan } = useTaskStore.getState();
    const { thinkingModel } = getModel();
    setStatus(t("research.common.thinking"));
    const thinkTagStreamProcessor = new ThinkTagStreamProcessor();
    const result = streamText({
      model: await createModelProvider(thinkingModel),
      system: getSystemPrompt(),
      prompt: [writeReportPlanPrompt(query), getResponseLanguagePrompt()].join(
        "\n\n"
      ),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: (error) => handleError(error),
    });
    let content = "";
    let reasoning = "";
    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        thinkTagStreamProcessor.processChunk(
          part.text,
          (data) => {
            content += data;
            updateReportPlan(content);
          },
          (data) => {
            reasoning += data;
          }
        );
      } else if (part.type === "reasoning-delta") {
        reasoning += part.text;
      }
    }
    if (reasoning) logger.log(reasoning);
    return content;
  }, [createModelProvider, getModel, smoothTextStreamType, t]);

  const searchLocalKnowledges = useCallback(
    async (query: string, researchGoal: string) => {
      const { resources, updateTask } = useTaskStore.getState();
      const knowledgeStore = useKnowledgeStore.getState();
      const knowledges: Knowledge[] = [];

      for (const item of resources) {
        if (item.status === "completed") {
          const resource = knowledgeStore.get(item.id);
          if (resource) {
            knowledges.push(resource);
          }
        }
      }

      const { networkingModel } = getModel();
      const thinkTagStreamProcessor = new ThinkTagStreamProcessor();
      const searchResult = streamText({
        model: await createModelProvider(networkingModel),
        system: getSystemPrompt(),
        prompt: [
          processSearchKnowledgeResultPrompt(query, researchGoal, knowledges),
          getResponseLanguagePrompt(),
        ].join("\n\n"),
        experimental_transform: smoothTextStream(smoothTextStreamType),
        onError: (error) => handleError(error),
      });
      let content = "";
      let reasoning = "";
      for await (const part of searchResult.fullStream) {
        if (part.type === "text-delta") {
          thinkTagStreamProcessor.processChunk(
            part.text,
            (data) => {
              content += data;
              updateTask(query, { learning: content });
            },
            (data) => {
              reasoning += data;
            }
          );
        } else if (part.type === "reasoning-delta") {
          reasoning += part.text;
        }
      }
      if (reasoning) logger.log(reasoning);
      return content;
    },
    [createModelProvider, getModel, smoothTextStreamType]
  );

  const runSearchTask = useCallback(
    async (queries: SearchTask[]) => {
      const {
        provider,
        enableSearch,
        searchProvider,
        parallelSearch,
        searchMaxResult,
        references,
        onlyUseLocalResource,
      } = useSettingStore.getState();
      const { resources, updateTask } = useTaskStore.getState();
      const { networkingModel } = getModel();
      setStatus(t("research.common.research"));
      const plimit = Plimit(parallelSearch);
      const thinkTagStreamProcessor = new ThinkTagStreamProcessor();
      const createModel = createSearchModelFactory({
        enableSearch,
        searchProvider,
        provider,
        createModelProvider,
      });
      const getTools = (model: string) =>
        getSearchTools({
          enableSearch,
          searchProvider,
          provider,
          model,
          searchMaxResult,
        });
      const getProviderOptions = (model: string) =>
        getSearchProviderOptions({
          enableSearch,
          searchProvider,
          provider,
          model,
          searchMaxResult,
        });
      await Promise.all(
        queries.map((item) =>
          plimit(async () => {
            let content = "";
            let reasoning = "";
            let searchResult;
            let sources: Source[] = [];
            let images: ImageSource[] = [];
            updateTask(item.query, { state: "processing" });

            if (resources.length > 0) {
              const knowledges = await searchLocalKnowledges(
                item.query,
                item.researchGoal
              );
              content += [
                knowledges,
                `### ${t("research.searchResult.references")}`,
                resources.map((item) => `- ${item.name}`).join("\n"),
              ].join("\n\n");

              if (onlyUseLocalResource === "enable") {
                updateTask(item.query, {
                  state: "completed",
                  learning: content,
                  sources,
                  images,
                });
                return content;
              } else {
                content += "\n\n---\n\n";
              }
            }

            if (enableSearch) {
              if (searchProvider !== "model") {
                try {
                  const results = await search(item.query);
                  sources = results.sources;
                  images = results.images;
                } catch (err) {
                  console.error(err);
                  handleError(
                    `[${searchProvider}]: ${
                      err instanceof Error ? err.message : "Search Failed"
                    }`
                  );
                  return plimit.clearQueue();
                }
                if (sources.length > 0) {
                  const enableReferences =
                    sources.length > 0 && references === "enable";
                  searchResult = streamText({
                    model: await createModel(networkingModel),
                    system: getSystemPrompt(),
                    prompt: [
                      processSearchResultPrompt(
                        item.query,
                        item.researchGoal,
                        sources,
                        enableReferences
                      ),
                      getResponseLanguagePrompt(),
                    ].join("\n\n"),
                    experimental_transform: smoothTextStream(smoothTextStreamType),
                    onError: (error) => handleError(error),
                  });
                } else {
                  // Fall back to model-generated search when no external results are found
                  searchResult = streamText({
                    model: await createModel(networkingModel),
                    system: getSystemPrompt(),
                    prompt: [
                      processResultPrompt(item.query, item.researchGoal),
                      getResponseLanguagePrompt(),
                    ].join("\n\n"),
                    tools: getTools(networkingModel),
                    providerOptions: getProviderOptions(networkingModel),
                    experimental_transform: smoothTextStream(smoothTextStreamType),
                    onError: (error) => handleError(error),
                  });
                }
              } else {
                searchResult = streamText({
                  model: await createModel(networkingModel),
                  system: getSystemPrompt(),
                  prompt: [
                    processResultPrompt(item.query, item.researchGoal),
                    getResponseLanguagePrompt(),
                  ].join("\n\n"),
                  tools: getTools(networkingModel),
                  providerOptions: getProviderOptions(networkingModel),
                  experimental_transform: smoothTextStream(smoothTextStreamType),
                  onError: (error) => handleError(error),
                });
              }
            } else {
              searchResult = streamText({
                model: await createModelProvider(networkingModel),
                system: getSystemPrompt(),
                prompt: [
                  processResultPrompt(item.query, item.researchGoal),
                  getResponseLanguagePrompt(),
                ].join("\n\n"),
                experimental_transform: smoothTextStream(smoothTextStreamType),
                onError: (err) => {
                  updateTask(item.query, { state: "failed" });
                  handleError(err);
                },
              });
            }
            for await (const part of searchResult.fullStream) {
              if (part.type === "text-delta") {
                thinkTagStreamProcessor.processChunk(
                  part.text,
                  (data) => {
                    content += data;
                    updateTask(item.query, { learning: content });
                  },
                  (data) => {
                    reasoning += data;
                  }
                );
              } else if (part.type === "reasoning-delta") {
                reasoning += part.text;
              } else if (part.type === "source") {
                // V2 source parts - extract URL from source structure
                if (part.sourceType === "url" && part.url) {
                  sources.push({
                    url: part.url,
                    title: part.title,
                  });
                }
              } else if (part.type === "finish") {
                // Provider-specific metadata handling moved to result processing
                // V2 finish parts have different metadata structure
              }
            }
            if (reasoning) logger.log(reasoning);

            if (sources.length > 0) {
              content +=
                "\n\n" +
                sources
                  .map(
                    (item, idx) =>
                      `[${idx + 1}]: ${item.url}${
                        item.title
                          ? ` "${item.title.replaceAll('"', " ")}"`
                          : ""
                      }`
                  )
                  .join("\n");
            }

            if (content.length > 0) {
              updateTask(item.query, {
                state: "completed",
                learning: content,
                sources,
                images,
              });
              return content;
            } else {
              updateTask(item.query, {
                state: "failed",
                learning: "",
                sources: [],
                images: [],
              });
              return "";
            }
          })
        )
      );
      plimit.clearQueue();
    },
    [
      createModelProvider,
      getModel,
      search,
      searchLocalKnowledges,
      smoothTextStreamType,
      t,
    ]
  );

  const reviewSearchResult = useCallback(async () => {
    const { reportPlan, tasks, suggestion, update } = useTaskStore.getState();
    const { thinkingModel } = getModel();
    setStatus(t("research.common.research"));
    const learnings = tasks.map((item) => item.learning);
    const thinkTagStreamProcessor = new ThinkTagStreamProcessor();
    const result = streamText({
      model: await createModelProvider(thinkingModel),
      system: getSystemPrompt(),
      prompt: [
        reviewSerpQueriesPrompt(reportPlan, learnings, suggestion),
        getResponseLanguagePrompt(),
      ].join("\n\n"),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });

    const querySchema = getSERPQuerySchema();
    let content = "";
    let reasoning = "";
    let queries: SearchTask[] = [];
    for await (const textPart of result.textStream) {
      thinkTagStreamProcessor.processChunk(
        textPart,
        async (text) => {
          content += text;
          const data = await parsePartialJson(
            removeJsonMarkdown(content)
          );
          if (
            querySchema.safeParse(data.value) &&
            data.state === "successful-parse"
          ) {
            if (data.value && Array.isArray(data.value)) {
              queries = (data.value as Array<{ query: string; researchGoal: string }>).map(
                (item) => ({
                  state: "unprocessed" as const,
                  learning: "",
                  sources: [],
                  images: [],
                  ...pick(item, ["query", "researchGoal"]),
                })
              );
            }
          }
        },
        (text) => {
          reasoning += text;
        }
      );
    }
    if (reasoning) logger.log(reasoning);
    if (queries.length > 0) {
      update([...tasks, ...queries]);
      await runSearchTask(queries);
    }
  }, [createModelProvider, getModel, runSearchTask, smoothTextStreamType, t]);

  const writeFinalReport = useCallback(async () => {
    const { citationImage, references } = useSettingStore.getState();
    const {
      reportPlan,
      tasks,
      setId,
      setTitle,
      setSources,
      requirement,
      updateFinalReport,
      backup,
    } = useTaskStore.getState();
    const { save } = useHistoryStore.getState();
    const { thinkingModel } = getModel();
    setStatus(t("research.common.writing"));
    updateFinalReport("");
    setTitle("");
    setSources([]);
    const learnings = tasks.map((item) => item.learning);
    const sources: Source[] = unique(
      flat(tasks.map((item) => item.sources || [])),
      (item) => item.url
    );
    const images: ImageSource[] = unique(
      flat(tasks.map((item) => item.images || [])),
      (item) => item.url
    );
    const enableCitationImage = images.length > 0 && citationImage === "enable";
    const enableReferences = sources.length > 0 && references === "enable";
    const thinkTagStreamProcessor = new ThinkTagStreamProcessor();
    const result = streamText({
      model: await createModelProvider(thinkingModel),
      system: [getSystemPrompt(), outputGuidelinesPrompt].join("\n\n"),
      prompt: [
        writeFinalReportPrompt(
          reportPlan,
          learnings,
          enableReferences
            ? sources.map((item) => pick(item, ["title", "url"]))
            : [],
          enableCitationImage ? images : [],
          requirement,
          enableCitationImage,
          enableReferences
        ),
        getResponseLanguagePrompt(),
      ].join("\n\n"),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });
    let content = "";
    let reasoning = "";
    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        thinkTagStreamProcessor.processChunk(
          part.text,
          (data) => {
            content += data;
            updateFinalReport(content);
          },
          (data) => {
            reasoning += data;
          }
        );
      } else if (part.type === "reasoning-delta") {
        reasoning += part.text;
      }
    }
    if (reasoning) logger.log(reasoning);
    if (sources.length > 0) {
      content +=
        "\n\n" +
        sources
          .map(
            (item, idx) =>
              `[${idx + 1}]: ${item.url}${
                item.title ? ` "${item.title.replaceAll('"', " ")}"` : ""
              }`
          )
          .join("\n");
      updateFinalReport(content);
    }
    if (content.length > 0) {
      const title = (content || "")
        .split("\n")[0]
        .replaceAll("#", "")
        .replaceAll("*", "")
        .trim();
      setTitle(title);
      setSources(sources);
      const id = save(backup());
      setId(id);
      return content;
    } else {
      return "";
    }
  }, [createModelProvider, getModel, smoothTextStreamType, t]);

  const deepResearch = useCallback(async () => {
    const { reportPlan, update } = useTaskStore.getState();
    const { thinkingModel } = getModel();
    setStatus(t("research.common.thinking"));
    try {
      const thinkTagStreamProcessor = new ThinkTagStreamProcessor();
      const result = streamText({
        model: await createModelProvider(thinkingModel),
        system: getSystemPrompt(),
        prompt: [
          generateSerpQueriesPrompt(reportPlan),
          getResponseLanguagePrompt(),
        ].join("\n\n"),
        experimental_transform: smoothTextStream(smoothTextStreamType),
        onError: handleError,
      });

      const querySchema = getSERPQuerySchema();
      let content = "";
      let reasoning = "";
      let queries: SearchTask[] = [];
      for await (const textPart of result.textStream) {
        thinkTagStreamProcessor.processChunk(
          textPart,
          async (text) => {
            content += text;
            const data = await parsePartialJson(
              removeJsonMarkdown(content)
            );
            if (querySchema.safeParse(data.value)) {
              if (
                data.state === "repaired-parse" ||
                data.state === "successful-parse"
              ) {
                if (data.value && Array.isArray(data.value)) {
                  queries = (data.value as Array<{ query: string; researchGoal: string }>).map(
                    (item) => ({
                      state: "unprocessed" as const,
                      learning: "",
                      sources: [],
                      images: [],
                      ...pick(item, ["query", "researchGoal"]),
                    })
                  );
                  update(queries);
                }
              }
            }
          },
          (text) => {
            reasoning += text;
          }
        );
      }
      if (reasoning) logger.log(reasoning);
      await runSearchTask(queries);
    } catch (err) {
      console.error(err);
    }
  }, [createModelProvider, getModel, runSearchTask, smoothTextStreamType, t]);

  return {
    status,
    deepResearch,
    askQuestions,
    writeReportPlan,
    runSearchTask,
    reviewSearchResult,
    writeFinalReport,
  };
}

export default useDeepResearch;
