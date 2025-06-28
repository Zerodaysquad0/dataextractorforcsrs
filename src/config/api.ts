
export const AI_API_CONFIG = {
  LLAMA_API_KEY: "a8143a63c57a410c8fa9bc786d985fb6",
  // Primary endpoint (Groq) - most reliable for Llama 3
  BASE_URL: "https://api.groq.com/openai/v1/chat/completions",
  MODEL: "llama3-70b-8192",
  MAX_CHUNK_SIZE: 6000,
  MAX_RETRIES: 3,
  TEMPERATURE: 0.1,
  
  // Fallback configurations for different providers
  FALLBACK_CONFIGS: [
    {
      BASE_URL: "https://api.together.xyz/v1/chat/completions",
      MODEL: "meta-llama/Llama-3-70b-chat-hf"
    },
    {
      BASE_URL: "https://api.openai.com/v1/chat/completions",
      MODEL: "gpt-3.5-turbo"
    }
  ]
};

// Legacy config for backward compatibility
export const TOGETHER_API_CONFIG = AI_API_CONFIG;
