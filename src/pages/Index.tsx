import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { AIResearch } from '@/components/AIResearch';
import { useExtraction } from '@/hooks/useExtraction';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Brain } from 'lucide-react';

export type SourceType = 'PDF' | 'Website' | 'Both';

const Index = () => {
  const [sourceType, setSourceType] = useState<SourceType>('Both');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState('');
  const [topic, setTopic] = useState('');

  const {
    results,
    isLoading,
    status,
    progress,
    images,
    handleExtract,
    structuredData,
  } = useExtraction();

  const onExtract = () => {
    handleExtract(topic, sourceType, selectedFiles, urls);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center animate-fade-in mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <FileText className="w-12 h-12 text-blue-600" />
              <Brain className="w-6 h-6 text-purple-600 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Data Extractor Pro
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered data extraction and research platform
          </p>
          <div className="mt-4 text-sm text-slate-500 font-medium">
            Created by <span className="text-blue-600 font-semibold">Rahul Sah</span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="extractor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="extractor" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Extractor
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Research Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extractor">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Panel - Input Controls */}
              <div className="space-y-6">
                {/* Keep existing extractor components */}
                <div className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Document Extraction</h3>
                  <p className="text-slate-600 mb-4">Extract and analyze content from PDFs and websites with AI-powered insights.</p>
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
                    onClick={onExtract}
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
              </div>
              
              {/* Right Panel - Results */}
              <div className="xl:sticky xl:top-8 xl:h-fit">
                <div className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Extraction Results</h3>
                  <p className="text-slate-600">Your extracted content will appear here...</p>
                  <ResultsArea
                    results={results}
                    isLoading={isLoading}
                    topic={topic}
                    images={images}
                    structuredData={structuredData}
                    source={selectedFiles.length > 0 ? selectedFiles[0].name : urls.split('\n')[0]}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research">
            <AIResearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

import { SourceSelector } from '@/components/SourceSelector';
import { FileUploader } from '@/components/FileUploader';
import { UrlInput } from '@/components/UrlInput';
import { TopicInput } from '@/components/TopicInput';
import { ExtractButton } from '@/components/ExtractButton';
import { StatusIndicator } from '@/components/StatusIndicator';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ResultsArea } from '@/components/ResultsArea';

export default Index;
