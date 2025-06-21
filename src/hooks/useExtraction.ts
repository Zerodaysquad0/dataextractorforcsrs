
import { useState } from 'react';
import { performExtraction } from '@/services/extractionService';
import { useToast } from '@/hooks/use-toast';
import type { SourceType } from '@/pages/Index';

export const useExtraction = () => {
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready to extract data content');
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [structuredData, setStructuredData] = useState<Array<Record<string, any>>>([]); // Add this
  const { toast } = useToast();

  const handleExtract = async (
    topic: string,
    sourceType: SourceType,
    selectedFiles: File[],
    urls: string
  ) => {
    if (!topic.trim()) {
      setStatus('Please enter a topic');
      toast({
        title: "Missing topic",
        description: "Please enter a topic to extract content about",
        variant: "destructive",
      });
      return;
    }

    const urlList = urls.split('\n').filter(url => url.trim());

    if (sourceType === 'PDF' && selectedFiles.length === 0) {
      setStatus('Please select PDF files');
      toast({
        title: "No files selected",
        description: "Please select at least one PDF file",
        variant: "destructive",
      });
      return;
    }

    if (sourceType === 'Website' && urlList.length === 0) {
      setStatus('Please enter website URLs');
      toast({
        title: "No URLs entered",
        description: "Please enter at least one website URL",
        variant: "destructive",
      });
      return;
    }

    if (sourceType === 'Both' && selectedFiles.length === 0 && urlList.length === 0) {
      setStatus('Please select files or enter URLs');
      toast({
        title: "No sources provided",
        description: "Please select PDF files or enter website URLs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults('');
    setProgress(0);
    setImages([]);
    setStructuredData([]); // Reset structured data

    try {
      const result = await performExtraction({
        sourceType,
        files: selectedFiles,
        urls: urlList,
        topic,
        onProgress: (prog, stat) => {
          setProgress(prog);
          setStatus(stat);
        }
      });

      if (result.success) {
        let resultsText = result.content;
        setImages(result.images || []);
        setStructuredData(result.structuredData || []); // Set structured data
        
        if (result.images && result.images.length > 0) {
          resultsText += `\n\nExtracted Images:\n`;
          result.images.forEach((imgUrl, idx) => {
            resultsText += `Image ${idx + 1}: ${imgUrl}\n`;
          });
        }
        setResults(resultsText);
        setStatus('✅ Extraction complete');
        toast({
          title: "Extraction successful",
          description: "Content has been extracted and analyzed",
        });
      } else {
        setStatus(`❌ ${result.error}`);
        toast({
          title: "Extraction failed",
          description: result.error || "An error occurred during extraction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setStatus('❌ Extraction failed');
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during extraction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return {
    results,
    isLoading,
    status,
    progress,
    images,
    structuredData, // Add this to return
    handleExtract,
  };
};
