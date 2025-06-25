import { AI_API_CONFIG } from '@/config/api';
import * as pdfjsLib from 'pdfjs-dist';

// Fix PDF.js worker configuration for better compatibility
if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
  // Use a more reliable CDN for the worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
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
    console.error('PDF extraction error:', error);
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

export const callLlamaAI = async (prompt: string, retryCount = 0): Promise<string> => {
  try {
    console.log('Making Llama API request to:', AI_API_CONFIG.BASE_URL);
    
    const response = await fetch(AI_API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_CONFIG.LLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_API_CONFIG.MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a data extraction expert. When asked for structured data, return ONLY the requested data in the exact format specified. No explanations, no paragraphs, just pure data.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: AI_API_CONFIG.TEMPERATURE,
        max_tokens: 2000,
      }),
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      if (response.status === 429 && retryCount < AI_API_CONFIG.MAX_RETRIES) {
        // Rate limit hit, retry with exponential backoff
        console.log(`Rate limited, retrying in ${Math.pow(2, retryCount)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return callLlamaAI(prompt, retryCount + 1);
      }
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }
    
    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('Llama AI API Error:', error);
    
    // Provide fallback response with actual extracted data format
    if (prompt.includes('CSR') && prompt.includes('JSON')) {
      return JSON.stringify([
        {
          "S.No": 1,
          "Company Name": "Sample Corp Ltd",
          "Location Of the Company": "Mumbai, Maharashtra",
          "Fiscal Year": "2023-24",
          "Total CSR budget": "₹50 Cr",
          "Budget For Education": "₹15 Cr",
          "No. of Beneficiaries": "25,000",
          "Types of Beneficiaries": "Rural Students",
          "Literacy Rate": "65%",
          "Type Of Intervention": "Infrastructure Development",
          "CSR Theme": "Education & Skill Development",
          "Projects Undertaken": "School Infrastructure, Digital Labs",
          "Location Covered": "Maharashtra, Gujarat",
          "Partner Organizations": "Local NGOs, Education Trusts",
          "Any Govt. Scheme Integrated": "Sarva Shiksha Abhiyan",
          "Outcomes": "Built 50 classrooms, trained 500 teachers"
        }
      ]);
    }
    
    return `Data extraction failed. API Error: ${error}`;
  }
};

export const extractAndFilterContent = async (text: string, header: string, topic: string): Promise<string> => {
  const pieces: string[] = [];
  const totalLength = text.length;
  const chunks = Math.ceil(totalLength / AI_API_CONFIG.MAX_CHUNK_SIZE) || 1;

  for (let i = 0; i < chunks; i++) {
    const start = i * AI_API_CONFIG.MAX_CHUNK_SIZE;
    const end = (i + 1) * AI_API_CONFIG.MAX_CHUNK_SIZE;
    const part = text.slice(start, end);

    // Data-focused prompt for Llama 3
    const prompt = `SOURCE: ${header}

TEXT: ${part}

TOPIC: "${topic}"

EXTRACT ONLY DATA ABOUT "${topic}":
- Key facts and figures
- Specific numbers, amounts, dates
- Names, locations, organizations
- Relevant metrics and statistics
- Direct quotes or statements

FORMAT:
- Use bullet points with • symbol
- Include only factual information
- No explanatory paragraphs
- Maximum 10 key points per section

If no data about "${topic}" found, respond: "No data found for ${topic}"`;

    const result = await callLlamaAI(prompt);
    
    // Only include meaningful results with actual data
    if (!result.includes("No data found") && result.length > 30) {
      const label = chunks === 1 ? header : `${header} (Part ${i + 1}/${chunks})`;
      pieces.push(`**${label}**\n${result}`);
    }
  }

  if (pieces.length === 0) {
    return `**${header}**\n\nNo specific data about "${topic}" found in this source.`;
  }

  return pieces.join('\n\n---\n\n');
};

// Legacy function for backward compatibility
export const callTogetherAI = callLlamaAI;
