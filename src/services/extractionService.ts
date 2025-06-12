
import { extractTextFromPDF, extractTextFromWebsite, extractAndFilterContent } from '@/utils/textExtraction';

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
}

export const performExtraction = async (params: ExtractionParams): Promise<ExtractionResult> => {
  const { sourceType, files, urls, topic, onProgress } = params;

  if (!topic.trim()) {
    return { success: false, content: '', error: 'Please enter a topic' };
  }

  try {
    const results: string[] = [];
    let completed = 0;
    const totalTasks = 
      (sourceType === 'PDF' || sourceType === 'Both' ? files.length : 0) +
      (sourceType === 'Website' || sourceType === 'Both' ? urls.length : 0);

    // Process PDFs
    if ((sourceType === 'PDF' || sourceType === 'Both') && files.length > 0) {
      for (const file of files) {
        onProgress?.(Math.round((completed / totalTasks) * 100), `Processing ${file.name}...`);
        
        const rawText = await extractTextFromPDF(file);
        const header = `FILE: ${file.name}`;
        const processedContent = await extractAndFilterContent(rawText, header, topic);
        results.push(processedContent);
        
        completed++;
      }
    }

    // Process URLs
    if ((sourceType === 'Website' || sourceType === 'Both') && urls.length > 0) {
      for (const url of urls) {
        if (!url.trim()) continue;
        
        onProgress?.(Math.round((completed / totalTasks) * 100), `Processing ${url}...`);
        
        const rawText = await extractTextFromWebsite(url);
        const header = `WEBSITE: ${url}`;
        const processedContent = await extractAndFilterContent(rawText, header, topic);
        results.push(processedContent);
        
        completed++;
      }
    }

    const finalContent = results.join('\n\n').trim() || 'No relevant content found.';
    
    onProgress?.(100, 'Extraction complete!');
    
    return {
      success: true,
      content: finalContent
    };

  } catch (error) {
    console.error('Extraction error:', error);
    return {
      success: false,
      content: '',
      error: `Extraction failed: ${error}`
    };
  }
};
