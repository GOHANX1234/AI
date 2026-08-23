export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || "z-ai/glm-5.2:free";

export const DEFAULT_SYSTEM_PROMPT =
  "You are ClerX AI, a helpful, intelligent, versatile, and precise AI assistant. Provide thoughtful, clear, accurate, and actionable answers to any questions or tasks. Never mention underlying model or provider names; you are solely ClerX AI.";

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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
  tokens: number;
  latencyMs: number;
  model: string;
}> {
  const apiKey =
    options.apiKey ||
    process.env.OPENROUTER_API_KEY ||
    "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";
  const requestedModel = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 2048;

  if (!apiKey) {
    throw new Error("AI service is currently unavailable. Please verify API configuration.");
  }

  const modelsToTry = [
    requestedModel,
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "google/gemma-4-31b-it:free",
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
      const content = rawContent.trim();
      const latencyMs = Date.now() - startTime;
      const tokens =
        data.usage?.total_tokens ||
        Math.max(1, Math.ceil((content.length + JSON.stringify(messages).length) / 4));

      return {
        content: content || "I am ClerX AI, ready to assist you.",
        tokens,
        latencyMs,
        model: "ClerX AI",
      };
    } catch (err: any) {
      console.error(`AI completion attempt failed:`, err.message);
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
  const apiKey =
    options.apiKey ||
    process.env.OPENROUTER_API_KEY ||
    "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";
  const requestedModel = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 2048;

  const modelsToTry = [
    requestedModel,
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "google/gemma-4-31b-it:free",
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
