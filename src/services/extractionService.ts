
import { extractTextFromPDF, extractTextFromWebsite, extractAndFilterContent, WebsiteExtractionResult } from '@/utils/textExtraction';

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
  summary?: string; // Added summary field
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
        summary: 'No relevant content found'
      };
    }

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
      summary: `Generated comprehensive analysis from ${meaningfulResults.length} sources`
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
