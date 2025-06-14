import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SourceSelector } from '@/components/SourceSelector';
import { FileUploader } from '@/components/FileUploader';
import { UrlInput } from '@/components/UrlInput';
import { TopicInput } from '@/components/TopicInput';
import { ExtractButton } from '@/components/ExtractButton';
import { ResultsArea } from '@/components/ResultsArea';
import { StatusIndicator } from '@/components/StatusIndicator';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { performExtraction } from '@/services/extractionService';
import { useToast } from '@/hooks/use-toast';
import { SourceHistoryProvider, useSourceHistory } from '@/context/SourceHistoryContext';
import { SourceHistorySidebar } from '@/components/SourceHistorySidebar';
import { Clock } from 'lucide-react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

export type SourceType = 'PDF' | 'Website' | 'Both';

// Helper for app main content to avoid duplication
const MainAppContent = ({
  showHistory,
  setShowHistory,
  handlePickURL,
  handlePickFile,
  sourceType,
  setSourceType,
  selectedFiles,
  setSelectedFiles,
  urls,
  setUrls,
  topic,
  setTopic,
  results,
  setResults,
  isLoading,
  setIsLoading,
  status,
  setStatus,
  progress,
  setProgress,
  images,
  setImages,
  handleExtract,
}) => (
  <SidebarProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full">
      <Button
        className="fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        onClick={() => setShowHistory(v => !v)}
        size="sm"
      >
        <Clock className="w-4 h-4 mr-2" />
        History
      </Button>
      <SourceHistorySidebar
        open={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectURL={handlePickURL}
        onSelectFile={handlePickFile}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Left Panel - Input Controls */}
          <div className="space-y-6">
            <SourceSelector
              sourceType={sourceType}
              setSourceType={setSourceType}
            />
            <FileUploader
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              disabled={sourceType === 'Website'}
            />
            <UrlInput
              urls={urls}
              setUrls={setUrls}
              disabled={sourceType === 'PDF'}
            />
            <TopicInput
              topic={topic}
              setTopic={setTopic}
            />
            <ExtractButton
              onClick={handleExtract}
              isLoading={isLoading}
            />
            {isLoading && (
              <ProgressIndicator
                progress={progress}
                status={status}
              />
            )}
            {!isLoading && (
              <StatusIndicator
                status={status}
                isLoading={isLoading}
              />
            )}
          </div>
          {/* Right Panel - Results */}
          <div className="xl:sticky xl:top-8 xl:h-fit">
            <ResultsArea
              results={results}
              isLoading={isLoading}
              topic={topic}
              images={images}
            />
          </div>
        </div>
      </div>
    </div>
  </SidebarProvider>
);

const MainIndex = () => {
  const [sourceType, setSourceType] = useState<SourceType>('Both');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState('');
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready to extract data content');
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  const [showHistory, setShowHistory] = useState(false);
  const { addSource } = useSourceHistory ? useSourceHistory() : { addSource: () => {} }; // fallback for anon

  const handleExtract = async () => {
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

    // Save source history (only if addSource exists)
    if (addSource) {
      if (sourceType === "PDF" || sourceType === "Both") {
        selectedFiles.forEach((file) => {
          addSource({
            id: `PDF:${file.name}`,
            type: "PDF",
            label: file.name,
            file: { name: file.name },
            created: Date.now(),
          });
        });
      }
      if ((sourceType === "Website" || sourceType === "Both") && urlList.length > 0) {
        urlList.forEach((url) => {
          addSource({
            id: `Website:${url}`,
            type: "Website",
            label: url,
            url,
            created: Date.now(),
          });
        });
      }
    }
    
    setIsLoading(true);
    setResults('');
    setProgress(0);
    setImages([]);

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

  const handlePickURL = (url: string) => {
    setUrls((prev) => prev.includes(url) ? prev : (prev ? prev + '\n' : '') + url);
    setSourceType("Website");
  };
  
  const handlePickFile = (fileMeta: { name: string }) => {
    toast({
      title: "PDF re-upload required",
      description: `Due to browser security, please select the file "${fileMeta.name}" again.`,
      variant: "default",
      duration: 5000,
    });
    setSourceType("PDF");
  };

  // This object will be shared with MainAppContent
  const shared = {
    showHistory, setShowHistory,
    handlePickURL, handlePickFile,
    sourceType, setSourceType,
    selectedFiles, setSelectedFiles,
    urls, setUrls,
    topic, setTopic,
    results, setResults,
    isLoading, setIsLoading,
    status, setStatus,
    progress, setProgress,
    images, setImages,
    handleExtract
  };

  return <MainAppContent {...shared} />;
};

const Index = () => {
  return (
    <SourceHistoryProvider>
      <MainIndex />
    </SourceHistoryProvider>
  );
};

const WrappedIndex = () => (
  <Index />
);

export default WrappedIndex;
