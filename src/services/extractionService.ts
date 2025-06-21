import { extractTextFromPDF, extractTextFromWebsite, extractAndFilterContent, WebsiteExtractionResult } from '@/utils/textExtraction';
import { callTogetherAI } from '@/utils/aiService';

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

    onProgress?.(0, `🔍 Starting detailed extraction for: "${topic}"`);

    // Parallel PDF processing with enhanced status updates
    if ((sourceType === 'PDF' || sourceType === 'Both') && files.length > 0) {
      for (const file of files) {
        const pdfPromise = (async () => {
          onProgress?.(Math.round((completed / totalTasks) * 100), `📄 Analyzing ${file.name} for "${topic}"`);
          const rawText = await extractTextFromPDF(file);
          const header = `PDF Document: ${file.name}`;
          const processedContent = await extractAndFilterContent(rawText, header, topic);
          completed++;
          onProgress?.(Math.round((completed / totalTasks) * 100), `✅ Extracted insights from ${file.name}`);
          return processedContent;
        })();
        pdfTasks.push(pdfPromise);
      }
    }

    // Parallel Website processing with enhanced status updates
    if ((sourceType === 'Website' || sourceType === 'Both') && urls.length > 0) {
      for (const url of urls) {
        if (!url.trim()) continue;
        const webPromise = (async () => {
          onProgress?.(Math.round((completed / totalTasks) * 100), `🌐 Analyzing ${url} for "${topic}"`);
          const websiteResult: WebsiteExtractionResult = await extractTextFromWebsite(url);
          const header = `Website: ${url}`;
          const processedContent = await extractAndFilterContent(websiteResult.text, header, topic);
          completed++;
          onProgress?.(Math.round((completed / totalTasks) * 100), `✅ Extracted insights from ${url}`);
          return { content: processedContent, images: websiteResult.images || [] };
        })();
        websiteTasks.push(webPromise);
      }
    }

    onProgress?.(50, '🧠 Processing content with AI analysis...');

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

    // Filter out empty or non-informative results
    const meaningfulResults = results.filter(result => 
      result.length > 100 && 
      !result.includes('No detailed information') &&
      !result.includes('No specific information')
    );

    if (meaningfulResults.length === 0) {
      return {
        success: true,
        content: `**Extraction Results for "${topic}"**\n\nNo detailed information specifically about "${topic}" was found in the provided sources. Consider:\n\n- Refining your topic to be more specific\n- Using different search terms\n- Checking if the sources contain relevant content\n- Trying alternative sources that might have more focused information`,
        images: allImages,
        summary: 'No relevant content found',
        structuredData: []
      };
    }

    // Generate structured data from the extracted content
    onProgress?.(80, '📊 Generating structured data tables...');
    const structuredData = await generateStructuredData(meaningfulResults.join('\n\n'), topic);

    // Create a comprehensive final output
    const finalContent = `# Comprehensive Analysis: "${topic}"\n\n` +
      `**Summary:** Found ${meaningfulResults.length} relevant source(s) with detailed information about "${topic}"\n\n` +
      `---\n\n${meaningfulResults.join('\n\n---\n\n')}\n\n` +
      `---\n\n**Analysis Complete** | Sources: ${meaningfulResults.length} | Images: ${allImages.length}`;

    onProgress?.(100, '🎯 Analysis complete! Generated comprehensive insights.');

    return {
      success: true,
      content: finalContent,
      images: allImages,
      summary: `Generated comprehensive analysis from ${meaningfulResults.length} sources`,
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

// New function to generate structured data
const generateStructuredData = async (content: string, topic: string): Promise<Array<Record<string, any>>> => {
  try {
    const prompt = `Analyze the following content and extract structured data relevant to "${topic}".

CONTENT TO ANALYZE:
${content}

INSTRUCTIONS:
1. Extract key information and structure it into a table format
2. Create appropriate column headers based on the content
3. Generate 3-8 rows of data (real extracted information, not generic examples)
4. Focus on quantitative data, names, dates, locations, amounts, etc.
5. If this is about CSR/companies, include fields like: Company Name, Location, Fiscal Year, Budget, Beneficiaries, Projects, etc.
6. If this is about research/studies, include: Study Name, Year, Sample Size, Key Findings, etc.
7. Return ONLY a JSON array of objects, each representing a table row

Example format:
[
  {
    "Company Name": "Example Corp",
    "Location": "Mumbai",
    "Fiscal Year": "2023-24",
    "CSR Budget": "₹50 Cr",
    "Focus Area": "Education"
  }
]

Return structured data as JSON array:`;

    const result = await callTogetherAI(prompt);
    
    // Try to parse JSON from the result
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsedData) ? parsedData : [];
    }
    
    // Fallback: create basic structured data from content analysis
    return createFallbackStructuredData(content, topic);
    
  } catch (error) {
    console.error('Structured data generation error:', error);
    return createFallbackStructuredData(content, topic);
  }
};

const createFallbackStructuredData = (content: string, topic: string): Array<Record<string, any>> => {
  // Basic extraction based on content patterns
  const lines = content.split('\n').filter(line => line.trim().length > 10);
  const data: Array<Record<string, any>> = [];
  
  // Look for company mentions, amounts, years, etc.
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
      'Amount/Value': amounts[i] || 'Not specified',
      'Year/Period': years[i] || 'Recent',
      'Topic': topic,
      'Source': 'Extracted Content'
    });
  }
  
  return data.length > 0 ? data : [
    {
      'S.No': 1,
      'Topic': topic,
      'Status': 'Data extracted successfully',
      'Content Length': `${content.length} characters`,
      'Generated On': new Date().toLocaleDateString()
    }
  ];
};
