
import { TOGETHER_API_CONFIG } from '@/config/api';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker for Vite+ESM compatibility.
if (
  typeof window !== "undefined" &&
  pdfjsLib.GlobalWorkerOptions &&
  // @ts-ignore (property exists on dist builds)
  !pdfjsLib.GlobalWorkerOptions.workerSrc
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text.trim();
  } catch (error) {
    return `[Error reading PDF ${file.name}]: ${error}`;
  }
};

export interface WebsiteExtractionResult {
  text: string;
  images: string[];
}

export const extractTextFromWebsite = async (url: string): Promise<WebsiteExtractionResult> => {
  try {
    // Note: Due to CORS restrictions, this would typically need to be done on the backend.
    // For demonstration, we simulate the extraction if not running on localhost.
    if (window.location.hostname !== "localhost") {
      return {
        text: `[Website Content from ${url}] - This is simulated website text content. In production, this would scrape actual content from the website.`,
        images: [],
      };
    }

    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    // Extract text from <p> tags
    const pMatches = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gi)];
    const text = pMatches.map(m => m[1].replace(/<[^>]+>/g, ' ').trim()).join('\n\n');

    // Extract <img src=...> images and convert any relative URL to absolute:
    const imgMatches = [...html.matchAll(/<img [^>]*src=["']([^"']+)["'][^>]*>/gi)];
    const images = imgMatches.map(match => {
      let src = match[1];
      try {
        // Convert relative URLs to absolute
        if (!/^https?:\/\//.test(src)) {
          const base = new URL(url);
          src = new URL(src, base).href;
        }
      } catch {}
      return src;
    });

    return { text, images };
  } catch (error) {
    return {
      text: `[Error fetching ${url}]: ${error}`,
      images: [],
    };
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

    // Enhanced prompt for better, more detailed output
    const prompt = `--- SOURCE: ${header} ---

TEXT TO ANALYZE:
${part}

EXTRACTION TOPIC: "${topic}"

INSTRUCTIONS:
You are an expert content analyst. Your task is to extract and present information that is DIRECTLY relevant to the topic "${topic}".

REQUIREMENTS:
1. ONLY extract content that specifically relates to "${topic}"
2. Provide detailed explanations, not just brief mentions
3. Include relevant context, examples, and specifics
4. Structure your response with clear sections
5. Use professional, comprehensive language
6. Include quantitative data, statistics, or metrics when available
7. Explain relationships, causes, effects, and implications
8. Provide actionable insights where applicable

OUTPUT FORMAT:
- Start with a brief overview paragraph
- Use bullet points with detailed explanations (use '-' symbol)
- Include specific examples, case studies, or scenarios
- Add relevant quotes or key statements
- Conclude with practical insights or implications

If no relevant content is found, respond with: "No specific information about '${topic}' found in this section."`;

    const result = await callTogetherAI(prompt);
    
    // Only include meaningful results
    if (!result.includes("No specific information") && result.length > 50) {
      const label = chunks === 1 ? header : `${header} (Section ${i + 1}/${chunks})`;
      pieces.push(`**${label}**\n\n${result}`);
    }
  }

  if (pieces.length === 0) {
    return `**${header}**\n\nNo detailed information specifically about "${topic}" was found in this source. The content may not contain relevant material or may require a different search approach.`;
  }

  return pieces.join('\n\n---\n\n');
};
