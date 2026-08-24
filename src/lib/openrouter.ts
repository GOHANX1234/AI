export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatContentPart[];
}

export const NEMOTRON_OMNI_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
export const TEXT_MODEL = "z-ai/glm-5.2:free";
export const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || TEXT_MODEL;

export const DEFAULT_SYSTEM_PROMPT =
  "You are ClerX AI, a helpful, intelligent, versatile, and precise AI assistant. Provide thoughtful, clear, accurate, and actionable answers to any questions or tasks. Never mention underlying model or provider names; you are solely ClerX AI.";

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
      reasoning?: string;
      reasoning_content?: string;
      thought?: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function parseThinkingAndContent(
  rawContent: string,
  reasoningField?: string
): { thought: string; content: string } {
  let thought = (reasoningField || "").trim();
  let content = rawContent || "";

  // Check if rawContent contains <think>...</think>
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const match = content.match(thinkRegex);
  if (match) {
    if (!thought) {
      thought = match[1].trim();
    }
    content = content.replace(thinkRegex, "").trim();
  } else {
    // Unclosed <think>...
    const unclosedMatch = content.match(/<think>([\s\S]*)$/i);
    if (unclosedMatch) {
      if (!thought) {
        thought = unclosedMatch[1].trim();
      }
      content = "";
    }
  }

  // Also check for [THOUGHT]...[/THOUGHT]
  const thoughtTagRegex = /\[THOUGHT\]([\s\S]*?)\[\/THOUGHT\]/i;
  const thoughtMatch = content.match(thoughtTagRegex);
  if (thoughtMatch) {
    if (!thought) {
      thought = thoughtMatch[1].trim();
    }
    content = content.replace(thoughtTagRegex, "").trim();
  }

  return { thought, content };
}

function hasMultimodalContent(messages: ChatMessage[]): boolean {
  return messages.some(
    (m) =>
      Array.isArray(m.content) &&
      m.content.some((p) => p.type === "image_url")
  );
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  } = {}
): Promise<{
  content: string;
  thought: string;
  thoughtDurationSec: number;
  tokens: number;
  latencyMs: number;
  model: string;
}> {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || "";
  const isMultimodal = hasMultimodalContent(messages);
  const requestedModel = isMultimodal
    ? NEMOTRON_OMNI_MODEL
    : options.model || TEXT_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 2048;

  if (!apiKey) {
    throw new Error("AI service is currently unavailable. Please verify API configuration.");
  }

  const modelsToTry = isMultimodal
    ? [
        NEMOTRON_OMNI_MODEL,
        "nvidia/nemotron-nano-12b-v2-vl:free",
        "google/gemini-2.5-flash-image",
      ]
    : [
        requestedModel,
        TEXT_MODEL,
        "nvidia/nemotron-3-super-120b-a12b:free",
        "liquid/lfm-2.5-2.6b:free",
        "poolside/laguna-s-2.1:free",
        "nvidia/nemotron-3-nano-30b-a3b:free",
      ];

  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastError: Error | null = null;

  for (const currentModel of uniqueModels) {
    const startTime = Date.now();
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
          "X-Title": process.env.SITE_NAME || "ClerX AI",
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (response.status === 429 || response.status === 503 || response.status === 404) {
        const errorText = await response.text();
        console.warn(`Upstream status ${response.status}: ${errorText}. Trying fallback...`);
        lastError = new Error(`Upstream service status ${response.status}`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error (${response.status}): ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      const choice = data.choices?.[0];
      const rawContent = choice?.message?.content || "";
      const reasoningField =
        choice?.message?.reasoning ||
        choice?.message?.reasoning_content ||
        choice?.message?.thought;
      
      const { thought, content } = parseThinkingAndContent(rawContent, reasoningField);
      const latencyMs = Date.now() - startTime;
      const thoughtDurationSec = Math.max(1, Math.round(latencyMs / 1000));
      const tokens =
        data.usage?.total_tokens ||
        Math.max(1, Math.ceil(((content + thought).length + JSON.stringify(messages).length) / 4));

      return {
        content: content || (thought ? "" : "I am ClerX AI, ready to assist you."),
        thought,
        thoughtDurationSec,
        tokens,
        latencyMs,
        model: "ClerX AI",
      };
    } catch (err: any) {
      console.error(`AI completion attempt failed for ${currentModel}:`, err.message);
      lastError = err;
    }
  }

  throw (
    lastError ||
    new Error("ClerX is currently experiencing high load. Please try again in a few moments.")
  );
}

// Streaming Response Generator
export async function getOpenRouterStreamResponse(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  } = {}
): Promise<Response> {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || "";
  const isMultimodal = hasMultimodalContent(messages);
  const requestedModel = isMultimodal
    ? NEMOTRON_OMNI_MODEL
    : options.model || TEXT_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 2048;

  if (!apiKey) {
    throw new Error("AI service is currently unavailable. Please verify API configuration.");
  }

  const modelsToTry = isMultimodal
    ? [
        NEMOTRON_OMNI_MODEL,
        "nvidia/nemotron-nano-12b-v2-vl:free",
        "google/gemini-2.5-flash-image",
      ]
    : [
        requestedModel,
        TEXT_MODEL,
        "nvidia/nemotron-3-super-120b-a12b:free",
        "liquid/lfm-2.5-2.6b:free",
        "poolside/laguna-s-2.1:free",
        "nvidia/nemotron-3-nano-30b-a3b:free",
      ];

  for (const currentModel of Array.from(new Set(modelsToTry))) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
          "X-Title": process.env.SITE_NAME || "ClerX AI",
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (response.ok && response.body) {
        return response;
      }
    } catch (e) {
      console.warn("Stream attempt failed for model:", currentModel, e);
    }
  }

  throw new Error("Failed to initialize response stream.");
}
