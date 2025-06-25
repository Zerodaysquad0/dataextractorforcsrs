
import { extractTextFromPDF, extractTextFromWebsite, extractAndFilterContent, WebsiteExtractionResult } from '@/utils/textExtraction';
import { callLlamaAI } from '@/utils/aiService';

export interface ExtractionParams {
  sourceType: 'PDF' | 'Website' | 'Both';
  files: File[];
  urls: string[];
  topic: string;
  onProgress?: (progress: number, status: string) => void;
}

export interface ExtractionResult {
  success: boolean;
  content: string;
  error?: string;
  images?: string[];
  summary?: string;
  structuredData?: Array<Record<string, any>>;
}

export const performExtraction = async (params: ExtractionParams): Promise<ExtractionResult> => {
  const { sourceType, files, urls, topic, onProgress } = params;

  if (!topic.trim()) {
    return { success: false, content: '', error: 'Please enter a topic to focus the extraction', images: [] };
  }

  try {
    let allImages: string[] = [];
    const pdfTasks: Promise<string>[] = [];
    const websiteTasks: Promise<{content: string; images: string[]}>[] = [];

    let totalTasks = 0;
    if (sourceType === 'PDF' || sourceType === 'Both') totalTasks += files.length;
    if (sourceType === 'Website' || sourceType === 'Both') totalTasks += urls.length;

    let completed = 0;

    onProgress?.(0, `🔍 Starting Llama 3 analysis for: "${topic}"`);

    // Parallel PDF processing with Llama 3
    if ((sourceType === 'PDF' || sourceType === 'Both') && files.length > 0) {
      for (const file of files) {
        const pdfPromise = (async () => {
          onProgress?.(Math.round((completed / totalTasks) * 100), `📄 Extracting data from ${file.name}`);
          const rawText = await extractTextFromPDF(file);
          const header = `PDF: ${file.name}`;
          const processedContent = await extractAndFilterContent(rawText, header, topic);
          completed++;
          onProgress?.(Math.round((completed / totalTasks) * 100), `✅ Data extracted from ${file.name}`);
          return processedContent;
        })();
        pdfTasks.push(pdfPromise);
      }
    }

    // Parallel Website processing with Llama 3
    if ((sourceType === 'Website' || sourceType === 'Both') && urls.length > 0) {
      for (const url of urls) {
        if (!url.trim()) continue;
        const webPromise = (async () => {
          onProgress?.(Math.round((completed / totalTasks) * 100), `🌐 Extracting data from ${url}`);
          const websiteResult: WebsiteExtractionResult = await extractTextFromWebsite(url);
          const header = `Website: ${url}`;
          const processedContent = await extractAndFilterContent(websiteResult.text, header, topic);
          completed++;
          onProgress?.(Math.round((completed / totalTasks) * 100), `✅ Data extracted from ${url}`);
          return { content: processedContent, images: websiteResult.images || [] };
        })();
        websiteTasks.push(webPromise);
      }
    }

    onProgress?.(50, '🧠 Processing with Llama 3 AI...');

    // Await all processing in parallel
    const [pdfResults, websiteResults] = await Promise.all([
      Promise.all(pdfTasks),
      Promise.all(websiteTasks),
    ]);

    let results: string[] = [];
    if (pdfResults.length) results.push(...pdfResults);
    if (websiteResults.length) {
      results.push(...websiteResults.map(r => r.content));
      allImages = websiteResults.reduce((arr, r) => arr.concat(r.images), [] as string[]);
    }

    // Filter meaningful results
    const meaningfulResults = results.filter(result => 
      result.length > 50 && 
      !result.includes('No specific data') &&
      !result.includes('No data found')
    );

    if (meaningfulResults.length === 0) {
      return {
        success: true,
        content: `**Data Extraction for "${topic}"**\n\nNo specific data about "${topic}" found in the provided sources.\n\n**Suggestions:**\n• Try more specific keywords\n• Check if sources contain relevant information\n• Use different file formats or sources`,
        images: allImages,
        summary: 'No relevant data found',
        structuredData: []
      };
    }

    // Generate structured data using Llama 3
    onProgress?.(80, '📊 Creating structured data tables...');
    const structuredData = await generateStructuredData(meaningfulResults.join('\n\n'), topic);

    // Create focused data output
    const finalContent = `# Data Analysis: "${topic}"\n\n` +
      `**Found:** ${meaningfulResults.length} source(s) with data about "${topic}"\n\n` +
      `${meaningfulResults.join('\n\n---\n\n')}\n\n` +
      `**Extraction Complete** | Sources: ${meaningfulResults.length} | Images: ${allImages.length} | Powered by Llama 3`;

    onProgress?.(100, '🎯 Data extraction complete!');

    return {
      success: true,
      content: finalContent,
      images: allImages,
      summary: `Extracted data from ${meaningfulResults.length} sources using Llama 3`,
      structuredData
    };
  } catch (error) {
    console.error('Extraction error:', error);
    return {
      success: false,
      content: '',
      error: `Extraction failed: ${error}`,
      images: [],
    };
  }
};

// Generate structured data using Llama 3
const generateStructuredData = async (content: string, topic: string): Promise<Array<Record<string, any>>> => {
  try {
    const prompt = `Extract structured data about "${topic}" from this content:

${content}

REQUIREMENTS:
1. Return ONLY a JSON array
2. Each object should be a table row
3. Include 3-8 data rows maximum
4. Use consistent column names
5. Focus on quantitative data (numbers, dates, amounts)
6. Include relevant fields like: names, locations, years, amounts, metrics

Example for CSR data:
[{"Company":"ABC Ltd","Year":"2023","Budget":"₹50Cr","Focus":"Education"}]

Return only the JSON array:`;

    const result = await callLlamaAI(prompt);
    
    // Extract JSON from response
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsedData) ? parsedData : [];
    }
    
    return createFallbackStructuredData(content, topic);
    
  } catch (error) {
    console.error('Structured data generation error:', error);
    return createFallbackStructuredData(content, topic);
  }
};

const createFallbackStructuredData = (content: string, topic: string): Array<Record<string, any>> => {
  const lines = content.split('\n').filter(line => line.trim().length > 10);
  const data: Array<Record<string, any>> = [];
  
  // Extract patterns from content
  const companyPattern = /([A-Z][a-zA-Z\s&]+(?:Ltd|Inc|Corp|Company|Industries|Group))/g;
  const amountPattern = /₹[\d,.]+ (?:crore|lakh|Cr|L)/gi;
  const yearPattern = /20\d{2}-?\d{0,2}/g;
  
  const companies = content.match(companyPattern) || [];
  const amounts = content.match(amountPattern) || [];
  const years = content.match(yearPattern) || [];
  
  for (let i = 0; i < Math.min(5, Math.max(companies.length, amounts.length, years.length, 3)); i++) {
    data.push({
      'S.No': i + 1,
      'Entity': companies[i] || `Item ${i + 1}`,
      'Amount': amounts[i] || 'Not specified',
      'Year': years[i] || 'Recent',
      'Topic': topic,
      'Source': 'Llama 3 Analysis'
    });
  }
  
  return data.length > 0 ? data : [
    {
      'S.No': 1,
      'Topic': topic,
      'Status': 'Processed with Llama 3',
      'Content Size': `${content.length} characters`,
      'Date': new Date().toLocaleDateString()
    }
  ];
};
