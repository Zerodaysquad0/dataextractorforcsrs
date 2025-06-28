
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
    return { 
      success: false, 
      content: '', 
      error: 'Please enter a topic to focus the extraction', 
      images: [],
      structuredData: []
    };
  }

  try {
    let allImages: string[] = [];
    const pdfTasks: Promise<string>[] = [];
    const websiteTasks: Promise<{content: string; images: string[]}>[] = [];

    let totalTasks = 0;
    if (sourceType === 'PDF' || sourceType === 'Both') totalTasks += files.length;
    if (sourceType === 'Website' || sourceType === 'Both') totalTasks += urls.length;

    let completed = 0;

    onProgress?.(0, `🔍 Starting AI analysis for: "${topic}"`);

    // Enhanced PDF processing with better error handling
    if ((sourceType === 'PDF' || sourceType === 'Both') && files.length > 0) {
      for (const file of files) {
        const pdfPromise = (async () => {
          try {
            onProgress?.(Math.round((completed / totalTasks) * 50), `📄 Processing ${file.name}...`);
            const rawText = await extractTextFromPDF(file);
            
            // Check if PDF extraction was successful
            if (rawText.includes('[Error reading PDF') || rawText.length < 50) {
              completed++;
              onProgress?.(Math.round((completed / totalTasks) * 50), `⚠️ ${file.name} - Limited content extracted`);
              return `**PDF: ${file.name}**\n\n• File processed but limited readable content found\n• PDF may be encrypted, image-based, or corrupted\n• Consider using OCR tools for image-based PDFs`;
            }
            
            const header = `PDF: ${file.name}`;
            const processedContent = await extractAndFilterContent(rawText, header, topic);
            completed++;
            onProgress?.(Math.round((completed / totalTasks) * 50), `✅ Successfully processed ${file.name}`);
            return processedContent;
          } catch (error) {
            completed++;
            console.error(`Error processing ${file.name}:`, error);
            onProgress?.(Math.round((completed / totalTasks) * 50), `❌ Error processing ${file.name}`);
            return `**PDF: ${file.name}**\n\n• Error processing file: ${error}\n• Please check if the file is corrupted or encrypted`;
          }
        })();
        pdfTasks.push(pdfPromise);
      }
    }

    // Enhanced Website processing with better error handling
    if ((sourceType === 'Website' || sourceType === 'Both') && urls.length > 0) {
      for (const url of urls) {
        if (!url.trim()) continue;
        const webPromise = (async () => {
          try {
            onProgress?.(Math.round((completed / totalTasks) * 50), `🌐 Accessing ${url}...`);
            const websiteResult: WebsiteExtractionResult = await extractTextFromWebsite(url);
            const header = `Website: ${url}`;
            const processedContent = await extractAndFilterContent(websiteResult.text, header, topic);
            completed++;
            onProgress?.(Math.round((completed / totalTasks) * 50), `✅ Successfully extracted from ${url}`);
            return { content: processedContent, images: websiteResult.images || [] };
          } catch (error) {
            completed++;
            console.error(`Error processing ${url}:`, error);
            onProgress?.(Math.round((completed / totalTasks) * 50), `❌ Error accessing ${url}`);
            return { 
              content: `**Website: ${url}**\n\n• Error accessing website: ${error}\n• Check if URL is correct and accessible`, 
              images: [] 
            };
          }
        })();
        websiteTasks.push(webPromise);
      }
    }

    onProgress?.(60, '🧠 Processing with AI...');

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

    // Filter and validate results
    const meaningfulResults = results.filter(result => 
      result.length > 100 && 
      !result.includes('Error processing file') &&
      !result.includes('Error accessing website')
    );

    const errorResults = results.filter(result => 
      result.includes('Error processing') || 
      result.includes('Limited content') ||
      result.includes('Error accessing')
    );

    onProgress?.(80, '📊 Creating structured data tables...');
    
    // Generate structured data even if some sources failed
    let structuredData: Array<Record<string, any>> = [];
    if (meaningfulResults.length > 0) {
      try {
        structuredData = await generateStructuredData(meaningfulResults.join('\n\n'), topic);
      } catch (error) {
        console.error('Structured data generation error:', error);
        structuredData = createFallbackStructuredData(meaningfulResults.join('\n\n'), topic);
      }
    }

    // Create comprehensive final content
    let finalContent = `# Data Analysis: "${topic}"\n\n`;
    
    if (meaningfulResults.length > 0) {
      finalContent += `**Found:** ${meaningfulResults.length} source(s) with relevant data\n\n`;
      finalContent += `${meaningfulResults.join('\n\n---\n\n')}\n\n`;
    }
    
    if (errorResults.length > 0) {
      finalContent += `**Processing Issues:**\n${errorResults.join('\n\n')}\n\n`;
    }
    
    if (meaningfulResults.length === 0 && errorResults.length > 0) {
      finalContent += `**Status:** Unable to extract meaningful data from provided sources\n\n`;
      finalContent += `**Suggestions:**\n`;
      finalContent += `• Check if files are readable and not encrypted\n`;
      finalContent += `• Verify website URLs are accessible\n`;
      finalContent += `• Try different file formats or sources\n`;
      finalContent += `• Use more specific search terms\n\n`;
    }

    finalContent += `**Analysis Complete** | Sources: ${results.length} | Successful: ${meaningfulResults.length} | Images: ${allImages.length}`;

    onProgress?.(100, meaningfulResults.length > 0 ? '✅ Extraction complete!' : '⚠️ Extraction completed with issues');

    return {
      success: true,
      content: finalContent,
      images: allImages,
      summary: meaningfulResults.length > 0 
        ? `Successfully extracted data from ${meaningfulResults.length} sources` 
        : `Processed ${results.length} sources with limited success`,
      structuredData
    };
    
  } catch (error) {
    console.error('Extraction service error:', error);
    return {
      success: false,
      content: '',
      error: `Extraction failed: ${error}. Please check your files and internet connection.`,
      images: [],
      structuredData: []
    };
  }
};

// Enhanced structured data generation
const generateStructuredData = async (content: string, topic: string): Promise<Array<Record<string, any>>> => {
  try {
    let prompt = '';
    
    // Customize prompt based on topic
    if (topic.toLowerCase().includes('csr') || content.toLowerCase().includes('csr')) {
      prompt = `Extract CSR data from this content and return ONLY a JSON array:

${content}

Required format - return ONLY the JSON array:
[
  {
    "S.No": 1,
    "Company Name": "Company Name Here",
    "Location Of the Company": "City, State",
    "Fiscal Year": "YYYY-YY",
    "Total CSR budget": "₹XX Cr",
    "Budget For Education": "₹XX Cr", 
    "No. of Beneficiaries": "Number",
    "Types of Beneficiaries": "Type description",
    "Literacy Rate": "XX%",
    "Type Of Intervention": "Intervention type",
    "CSR Theme": "Theme name",
    "Projects Undertaken": "Project description",
    "Location Covered": "Areas covered",
    "Partner Organizations": "Partners",
    "Any Govt. Scheme Integrated": "Scheme name",
    "Outcomes": "Results achieved"
  }
]

Return ONLY the JSON array, no explanations.`;
    } else if (topic.toLowerCase().includes('traveller') || topic.toLowerCase().includes('traveler')) {
      prompt = `Find traveller information from this content and return ONLY a JSON array:

${content}

Required format:
[
  {
    "S.No": 1,
    "Traveller Name": "Name found",
    "Location": "Travel location",
    "Purpose": "Travel purpose",
    "Date": "Travel date if mentioned",
    "Additional Info": "Other relevant details"
  }
]

If no traveller information found, return: [{"S.No": 1, "Status": "No traveller information found", "Content": "Document may not contain travel details"}]

Return ONLY the JSON array.`;
    } else {
      prompt = `Extract structured data about "${topic}" from this content:

${content}

Return ONLY a JSON array with relevant data points:
[{"S.No": 1, "Field1": "Value1", "Field2": "Value2", ...}]

Focus on key facts, numbers, names, dates. Return ONLY the JSON array.`;
    }

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
