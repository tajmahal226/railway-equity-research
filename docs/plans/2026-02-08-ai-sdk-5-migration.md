# AI SDK 5.0 Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate from AI SDK 4.x to 5.0, updating custom providers and stream handling for breaking changes.

**Architecture:** Update custom provider implementations to use new LanguageModelV3 interface from @ai-sdk/provider, migrate stream protocol from single chunks to start/delta/end pattern, and update all SDK usage throughout codebase.

**Tech Stack:** AI SDK 5.0, TypeScript, Next.js 16, Vercel AI SDK providers

---

## Overview

AI SDK 5.0 has major breaking changes that affect this codebase:

1. **Stream protocol changes:** `text-delta` with `textDelta` property → start/delta/end pattern with IDs
2. **Custom provider interfaces:** LanguageModelV1 → LanguageModelV3 (from @ai-sdk/provider)
3. **Usage properties:** `promptTokens/completionTokens` → `inputTokens/outputTokens`
4. **Type renames:** CoreMessage → ModelMessage, Message → UIMessage
5. **Tool properties:** `args/result` → `input/output`, `parameters` → `inputSchema`

**Critical files affected:**
- `src/utils/xai-provider.ts` - Custom XAI provider implementation
- `src/utils/openai-responses-provider.ts` - Custom OpenAI Responses API provider
- `src/hooks/useDeepResearch.ts` - Stream consumption
- `src/utils/deep-research/provider.ts` - Provider factory
- `package.json` - Dependency updates

---

## Task 1: Install AI SDK 5.0 Dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (auto-generated)

**Step 1: Update package.json with AI SDK 5.0 versions**

```json
{
  "dependencies": {
    "ai": "^5.0.52",
    "@ai-sdk/provider": "^2.0.0",
    "@ai-sdk/provider-utils": "^3.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/google": "^1.0.0",
    "@ai-sdk/deepseek": "^1.0.0",
    "@ai-sdk/mistral": "^1.0.0",
    "@ai-sdk/openrouter": "^1.0.0",
    "ollama-ai-provider": "^1.0.0",
    "@ai-sdk/react": "^1.0.0",
    "zod": "^4.1.8"
  }
}
```

**Step 2: Install dependencies**

Run: `cd /home/tyler/railway-equity-research && pnpm install`
Expected: Packages install successfully, no peer dependency conflicts

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: upgrade to AI SDK 5.0 dependencies"
```

---

## Task 2: Run Official Codemod

**Files:**
- Modify: Multiple files (auto-modified by codemod)

**Step 1: Run AI SDK 5.0 codemod**

Run: `npx @ai-sdk/codemod v5 src/`
Expected: Codemod processes files and reports changes

**Step 2: Review and commit codemod changes**

Run: `git diff`
Expected: See auto-fixed changes like `textDelta` → `text`, `convertToCoreMessages` → `convertToModelMessages`, etc.

**Step 3: Commit**

```bash
git add .
git commit -m "refactor: apply AI SDK 5.0 codemod transformations"
```

---

## Task 3: Update XAI Provider to LanguageModelV3

**Files:**
- Modify: `src/utils/xai-provider.ts`

**Step 1: Update imports**

```typescript
import { LanguageModelV3, LanguageModelV3StreamPart } from '@ai-sdk/provider';
```

**Step 2: Update specificationVersion**

```typescript
class XAILanguageModel {
  readonly specificationVersion = "v3" as const;
  // ... rest of class
}
```

**Step 3: Update doGenerate interface**

```typescript
async doGenerate(options: {
  mode: "regular" | { type: "object-json"; schema: any } | { type: "object-tool"; tool: any };
  messages: any[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  responseFormat?: { type: "json" | "text" };
  seed?: number;
  abortSignal?: AbortSignal;
  providerOptions?: Record<string, Record<string, any>>;
}): Promise<{
    text?: string;
  toolCalls?: any[];
    finishReason: "stop" | "length" | "other" | "error" | "unknown";
  usage: { inputTokens: number; outputTokens: number };
  rawCall: { rawPrompt: any; rawSettings: Record<string, unknown> };
  rawResponse?: { headers?: Record<string, string> };
  response?: { id?: string; timestamp?: Date; modelId?: string };
  warnings?: any[];
}> {
  const messages = options.messages; // Already in correct format for v5
  const body: any = {
    model: this.modelId,
    messages,
  };

  if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
  if (options.temperature !== undefined) body.temperature = options.temperature;
  if (options.topP !== undefined) body.top_p = options.topP;
  if (options.stopSequences !== undefined) body.stop = options.stopSequences;
  if (options.responseFormat?.type === "json") body.response_format = { type: "json_object" };

  const response = await fetch(`${this.config.baseURL}/chat/completions`, {
    method: "POST",
    headers: this.getAuthHeaders(),
    body: JSON.stringify(body),
    signal: options.abortSignal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`xAI API error (${response.status}): ${text}`);
  }

  const data = await response.json() as any;
  const choice = data.choices?.[0];

  return {
    text: choice?.message?.content || "",
    finishReason: this.mapFinishReason(choice?.finish_reason),
    usage: {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    },
    rawCall: {
      rawPrompt: messages,
      rawSettings: body,
    },
    response: {
      id: data.id,
      timestamp: new Date(),
      modelId: data.model,
    },
    warnings: [],
  };
}
```

**Step 4: Update doStream interface and stream protocol**

```typescript
async doStream(options: {
  mode: "regular" | { type: "object-json"; schema: any } | { type: "object-tool"; tool: any };
  messages: any[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  responseFormat?: { type: "json" | "text" };
  seed?: number;
  abortSignal?: AbortSignal;
  providerOptions?: Record<string, Record<string, any>>;
}): Promise<{
  stream: ReadableStream<LanguageModelV3StreamPart>;
  rawCall: { rawPrompt: any; rawSettings: Record<string, unknown> };
  rawResponse?: { headers?: Record<string, string> };
  warnings?: any[];
}> {
  const messages = options.messages;
  const body: any = {
    model: this.modelId,
    messages,
    stream: true,
  };

  if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
  if (options.temperature !== undefined) body.temperature = options.temperature;
  if (options.topP !== undefined) body.top_p = options.topP;
  if (options.stopSequences !== undefined) body.stop = options.stopSequences;

  const response = await fetch(`${this.config.baseURL}/chat/completions`, {
    method: "POST",
    headers: this.getAuthHeaders(),
    body: JSON.stringify(body),
    signal: options.abortSignal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`xAI API error (${response.status}): ${text}`);
  }

  const stream = this.createStream(response);

  return {
    stream,
    rawCall: {
      rawPrompt: messages,
      rawSettings: body,
    },
    warnings: [],
  };
}

private createStream(response: Response): ReadableStream<LanguageModelV3StreamPart> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let textId = ""; // Track text block ID for v5

  return new ReadableStream({
    start: async (controller) => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const chunk = JSON.parse(data);
              const delta = chunk.choices?.[0]?.delta;

              // V5 stream protocol with start/delta/end
              if (delta?.content) {
                // Send text-start for new text block
                if (!textId) {
                  textId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                  controller.enqueue({
                    type: "text-start",
                    id: textId,
                  } as LanguageModelV3StreamPart);
                }

                // Send text-delta
                controller.enqueue({
                  type: "text-delta",
                  id: textId,
                  delta: delta.content,
                } as LanguageModelV3StreamPart);
              }

              if (chunk.usage) {
                // Send text-end before finish
                if (textId) {
                  controller.enqueue({
                    type: "text-end",
                    id: textId,
                  } as LanguageModelV3StreamPart);
                }

                // Send finish event
                controller.enqueue({
                  type: "finish",
                  usage: {
                    inputTokens: chunk.usage.prompt_tokens || 0,
                    outputTokens: chunk.usage.completion_tokens || 0,
                  },
                  finishReason: "stop",
                } as LanguageModelV3StreamPart);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }

        // Ensure text-end is sent if stream ends unexpectedly
        if (textId) {
          controller.enqueue({
            type: "text-end",
            id: textId,
          } as LanguageModelV3StreamPart);
        }

        controller.enqueue({
          type: "finish",
          usage: { inputTokens: 0, outputTokens: 0 },
          finishReason: "stop",
        } as LanguageModelV3StreamPart);
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
```

**Step 5: Remove convertPromptToMessages (no longer needed in v5)**

Delete the `convertPromptToMessages` method - v5 uses ModelMessage format directly.

**Step 6: Commit**

```bash
git add src/utils/xai-provider.ts
git commit -m "refactor: migrate xai-provider to AI SDK 5.0 LanguageModelV3"
```

---

## Task 4: Update OpenAI Responses Provider to LanguageModelV3

**Files:**
- Modify: `src/utils/openai-responses-provider.ts`

**Step 1: Update imports**

```typescript
import { LanguageModelV3, LanguageModelV3StreamPart } from '@ai-sdk/provider';
```

**Step 2: Update specificationVersion**

```typescript
class OpenAIResponsesLanguageModel {
  readonly specificationVersion = "v3" as const;
  // ... rest of class
}
```

**Step 3: Update doGenerate interface**

Same pattern as Task 3, Step 3, but using Responses API endpoints:
- URL: `${this.config.baseURL}/responses`
- Request format: `input` array (not `messages`)
- Response parsing: handle `output` array structure

**Step 4: Update doStream interface**

Same pattern as Task 3, Step 4, but:
- Handle Responses API SSE format
- Events are `response.output_text.delta` (not `choices[0].delta.content`)

**Step 5: Commit**

```bash
git add src/utils/openai-responses-provider.ts
git commit -m "refactor: migrate openai-responses-provider to AI SDK 5.0"
```

---

## Task 5: Update Stream Consumption in useDeepResearch

**Files:**
- Modify: `src/hooks/useDeepResearch.ts`

**Step 1: Update stream part handling for v5 protocol**

Find all instances of stream part handling and update:

OLD (v4):
```typescript
for await (const part of result.fullStream) {
  if (part.type === "text-delta") {
    content += part.textDelta;
    updateQuestions(content);
  }
}
```

NEW (v5):
```typescript
for await (const part of result.fullStream) {
  if (part.type === "text-delta") {
    content += part.text; // Changed from textDelta to text
    updateQuestions(content);
  } else if (part.type === "text-start") {
    // Optional: track new text block
  } else if (part.type === "text-end") {
    // Optional: finalize text block
  }
}
```

**Step 2: Update reasoning stream handling**

OLD (v4):
```typescript
else if ((part as any).type === "reasoning-delta") {
  reasoning += (part as any).textDelta;
}
```

NEW (v5):
```typescript
else if (part.type === "reasoning-delta") {
  reasoning += part.text; // Changed from textDelta to text
}
```

**Step 3: Update finish event handling**

OLD (v4):
```typescript
else if (part.type === "finish") {
  if (reasoning) logger.log(reasoning);
  return content;
}
```

NEW (v5):
```typescript
else if (part.type === "finish") {
  if (reasoning) logger.log(reasoning);
  // Note: usage now has inputTokens/outputTokens
  return content;
}
```

**Step 4: Commit**

```bash
git add src/hooks/useDeepResearch.ts
git commit -m "refactor: update stream consumption for AI SDK 5.0 protocol"
```

---

## Task 6: Update Provider Factory

**Files:**
- Modify: `src/utils/deep-research/provider.ts`

**Step 1: No changes needed**

The `createAIProvider` function already uses provider SDKs correctly. The official SDK packages (@ai-sdk/openai, @ai-sdk/anthropic, etc.) handle their own interfaces.

**Step 2: Verify custom provider calls**

Ensure the custom provider functions are called correctly:
- `createOpenAIResponsesProvider()` - should work after Task 4
- `createXAIProvider()` - should work after Task 3

---

## Task 7: Update Type Imports Across Codebase

**Files:**
- Modify: Multiple files

**Step 1: Update imports in hooks and utils**

Find and replace:
```typescript
// Old v4 imports:
import { CoreMessage } from 'ai';
import { Message } from 'ai';
import { convertToCoreMessages } from 'ai';

// New v5 imports:
import { ModelMessage } from 'ai';
import { UIMessage } from 'ai';
import { convertToModelMessages } from 'ai';
```

**Step 2: Update type usages**

Replace `CoreMessage` with `ModelMessage`, `Message` with `UIMessage` throughout.

**Step 3: Commit**

```bash
git add .
git commit -m "refactor: update type imports for AI SDK 5.0"
```

---

## Task 8: Run Tests and Verify

**Files:**
- Test: All test files

**Step 1: Run tests**

Run: `pnpm test`
Expected: Tests may fail initially due to stream protocol changes

**Step 2: Fix failing tests**

Update test assertions to match v5 stream protocol:
- `textDelta` → `text` or `delta` depending on context
- `promptTokens/completionTokens` → `inputTokens/outputTokens`
- Add handling for `text-start`/`text-end` events

**Step 3: Commit**

```bash
git add .
git commit -m "test: update tests for AI SDK 5.0 compatibility"
```

---

## Task 9: Manual Testing

**Files:**
- Manual verification

**Step 1: Start dev server**

Run: `pnpm dev`
Expected: Server starts without errors

**Step 2: Test research functionality**

1. Open http://localhost:3000
2. Configure API keys (OpenAI or other provider)
3. Run a simple research query
4. Verify streaming works correctly

**Step 3: Check browser console**

Expected: No errors, streaming responses complete successfully

**Step 4: Final commit if successful**

```bash
git add .
git commit -m "chore: complete AI SDK 5.0 migration"
```

---

## Rollback Plan (if issues occur)

If critical issues arise during migration:

```bash
# Rollback to pre-migration state
git reflog | head
git reset --hard <commit-before-migration>
pnpm install
```

---

## Additional Notes

- **Zod 4.1.8+ required** - For TypeScript performance with AI SDK 5.0
- **@ai-sdk/provider package** - New package for LanguageModelV3 interface
- **Custom providers** - Required complete rewrite for v3 interface
- **Stream protocol** - Most invasive change, requires updating all consumption points

---

## References

- [AI SDK 5.0 Migration Guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0)
- [LanguageModelV3 Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/language-model-v3)
- [Stream Protocol Changes](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0#stream-protocol-changes)
