
export const AI_API_CONFIG = {
  LLAMA_API_KEY: "a8143a63c57a410c8fa9bc786d985fb6",
  // Using Groq's endpoint for Llama 3 models (more reliable)
  BASE_URL: "https://api.groq.com/openai/v1/chat/completions",
  MODEL: "llama3-70b-8192",
  MAX_CHUNK_SIZE: 8000,
  MAX_RETRIES: 5,
  TEMPERATURE: 0.1
};

// Legacy config for backward compatibility
export const TOGETHER_API_CONFIG = AI_API_CONFIG;
