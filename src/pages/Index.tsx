
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
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginDialog } from '@/components/LoginDialog';
import { Button } from '@/components/ui/button';

export type SourceType = 'PDF' | 'Website' | 'Both';

// Helper: User Info Avatar/Menu
const UserBar: React.FC<{ onLogout: () => void, user: any }> = ({ onLogout, user }) => (
  <div className="fixed top-4 right-4 z-50 flex items-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 gap-3 border border-white/20">
    <img 
      src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} 
      alt="avatar" 
      className="w-8 h-8 rounded-full border-2 border-blue-200" 
    />
    <div className="flex flex-col">
      <span className="font-medium text-slate-700 text-sm">{user.user_metadata?.full_name || user.email}</span>
      <span className="text-xs text-slate-500">{user.email}</span>
    </div>
    <Button onClick={onLogout} size="sm" variant="outline" className="text-xs">
      Logout
    </Button>
  </div>
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

  // Source history sidebar control
  const [showHistory, setShowHistory] = useState(false);
  const { addSource } = useSourceHistory();

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

    // Save source history
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

  return (
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
};

const AuthenticatedApp = () => {
  return (
    <SourceHistoryProvider>
      <MainIndex />
    </SourceHistoryProvider>
  );
};

const Index = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-blue-700 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Welcome to Data Extractor</h1>
          <p className="text-slate-600 mb-8">Sign in to start extracting and analyzing data from PDFs and websites</p>
          <Button 
            className="px-10 py-4 text-base bg-blue-600 hover:bg-blue-700" 
            onClick={() => setLoginOpen(true)}
          >
            Sign in to Continue
          </Button>
        </div>
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  return (
    <>
      <UserBar user={user} onLogout={signOut} />
      <AuthenticatedApp />
    </>
  );
};

const WrappedIndex = () => (
  <AuthProvider>
    <Index />
  </AuthProvider>
);

export default WrappedIndex;
