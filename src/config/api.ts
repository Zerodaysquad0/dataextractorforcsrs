
export const AI_API_CONFIG = {
  LLAMA_API_KEY: "a8143a63c57a410c8fa9bc786d985fb6",
  // Primary endpoint - Together.ai with free Llama model
  BASE_URL: "https://api.together.xyz/v1/chat/completions",
  MODEL: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
  MAX_CHUNK_SIZE: 6000,
  MAX_RETRIES: 3,
  TEMPERATURE: 0.1,
  
  // Fallback configurations for different providers
  FALLBACK_CONFIGS: [
    {
      BASE_URL: "https://api.groq.com/openai/v1/chat/completions",
      MODEL: "llama3-70b-8192"
    },
    {
      BASE_URL: "https://api.together.xyz/v1/chat/completions",
      MODEL: "meta-llama/Llama-3-70b-chat-hf"
    }
  ]
};

// Legacy config for backward compatibility
export const TOGETHER_API_CONFIG = AI_API_CONFIG;
