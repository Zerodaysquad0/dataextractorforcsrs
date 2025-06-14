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
  images?: string[]; // Added field: images from website
}

export const performExtraction = async (params: ExtractionParams): Promise<ExtractionResult> => {
  const { sourceType, files, urls, topic, onProgress } = params;

  if (!topic.trim()) {
    return { success: false, content: '', error: 'Please enter a topic', images: [] };
  }

  try {
    let allImages: string[] = [];
    const pdfTasks: Promise<string>[] = [];
    const websiteTasks: Promise<{content: string; images: string[]}>[] = [];

    let totalTasks = 0;
    if (sourceType === 'PDF' || sourceType === 'Both') totalTasks += files.length;
    if (sourceType === 'Website' || sourceType === 'Both') totalTasks += urls.length;

    let completed = 0;

    // Parallel PDF processing
    if ((sourceType === 'PDF' || sourceType === 'Both') && files.length > 0) {
      for (const file of files) {
        const pdfPromise = (async () => {
          onProgress?.(Math.round((completed / totalTasks) * 100), `Processing ${file.name}...`);
          const rawText = await extractTextFromPDF(file);
          const header = `FILE: ${file.name}`;
          const processedContent = await extractAndFilterContent(rawText, header, topic);
          completed++;
          onProgress?.(Math.round((completed / totalTasks) * 100), `Processed ${file.name}`);
          return processedContent;
        })();
        pdfTasks.push(pdfPromise);
      }
    }

    // Parallel Website processing
    if ((sourceType === 'Website' || sourceType === 'Both') && urls.length > 0) {
      for (const url of urls) {
        if (!url.trim()) continue;
        const webPromise = (async () => {
          onProgress?.(Math.round((completed / totalTasks) * 100), `Processing ${url}...`);
          const websiteResult: WebsiteExtractionResult = await extractTextFromWebsite(url);
          const header = `WEBSITE: ${url}`;
          const processedContent = await extractAndFilterContent(websiteResult.text, header, topic);
          completed++;
          onProgress?.(Math.round((completed / totalTasks) * 100), `Processed ${url}`);
          return { content: processedContent, images: websiteResult.images || [] };
        })();
        websiteTasks.push(webPromise);
      }
    }

    // Await all processing in parallel, flattening results where needed
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

    const finalContent = results.join('\n\n').trim() || 'No relevant content found.';
    onProgress?.(100, 'Extraction complete!');

    return {
      success: true,
      content: finalContent,
      images: allImages,
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
