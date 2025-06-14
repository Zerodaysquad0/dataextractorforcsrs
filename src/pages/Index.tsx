import { useState } from 'react';
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

export type SourceType = 'PDF' | 'Website' | 'Both';

const Index = () => {
  const [sourceType, setSourceType] = useState<SourceType>('Both');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState('');
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready to extract data content');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

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

    setIsLoading(true);
    setResults('');
    setProgress(0);

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
        setResults(result.content);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
