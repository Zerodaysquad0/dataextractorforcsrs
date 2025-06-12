
import { TOGETHER_API_CONFIG } from '@/config/api';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // For now, we'll simulate PDF text extraction
    // In a real implementation, you'd use a library like pdf-parse or send to a backend
    return `[PDF Content from ${file.name}] - This is simulated PDF text content for demonstration. In production, this would extract actual text from the PDF file.`;
  } catch (error) {
    return `[Error reading PDF ${file.name}]: ${error}`;
  }
};

export const extractTextFromWebsite = async (url: string): Promise<string> => {
  try {
    // Note: Due to CORS restrictions, this would typically need to be done on the backend
    // For demonstration, we'll simulate the extraction
    return `[Website Content from ${url}] - This is simulated website text content. In production, this would scrape actual content from the website.`;
  } catch (error) {
    return `[Error fetching ${url}]: ${error}`;
  }
};

export const callTogetherAI = async (prompt: string, retryCount = 0): Promise<string> => {
  try {
    const response = await fetch(TOGETHER_API_CONFIG.BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TOGETHER_API_CONFIG.MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: TOGETHER_API_CONFIG.TEMPERATURE,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 && retryCount < TOGETHER_API_CONFIG.MAX_RETRIES) {
        // Rate limit hit, retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return callTogetherAI(prompt, retryCount + 1);
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Together.ai API Error:', error);
    return `[Together.ai Error]: ${error}`;
  }
};

export const extractAndFilterContent = async (text: string, header: string, topic: string): Promise<string> => {
  const pieces: string[] = [];
  const totalLength = text.length;
  const chunks = Math.ceil(totalLength / TOGETHER_API_CONFIG.MAX_CHUNK_SIZE) || 1;

  for (let i = 0; i < chunks; i++) {
    const start = i * TOGETHER_API_CONFIG.MAX_CHUNK_SIZE;
    const end = (i + 1) * TOGETHER_API_CONFIG.MAX_CHUNK_SIZE;
    const part = text.slice(start, end);

    const prompt = `--- ${header} ---

${part}

Topic: ${topic}

Extract ONLY content strictly about the topic above. Write a clear paragraph, then bullet insights using '-' (no '*' or other symbols).`;

    const result = await callTogetherAI(prompt);
    const label = chunks === 1 ? header : `${header} (part ${i + 1}/${chunks})`;
    pieces.push(`**${label}**\n\n${result}`);
  }

  return pieces.join('\n\n');
};
