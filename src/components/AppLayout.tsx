
import React from 'react';
import { Header } from '@/components/Header';
import { InputControls } from '@/components/InputControls';
import { ResultsArea } from '@/components/ResultsArea';
import { SidebarProvider } from "@/components/ui/sidebar";
import type { SourceType } from '@/pages/Index';

interface AppLayoutProps {
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  urls: string;
  setUrls: (urls: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  results: string;
  isLoading: boolean;
  status: string;
  progress: number;
  images: string[];
  onExtract: () => void;
}

export const AppLayout = ({
  sourceType,
  setSourceType,
  selectedFiles,
  setSelectedFiles,
  urls,
  setUrls,
  topic,
  setTopic,
  results,
  isLoading,
  status,
  progress,
  images,
  onExtract,
}: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Header />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
            {/* Left Panel - Input Controls */}
            <InputControls
              sourceType={sourceType}
              setSourceType={setSourceType}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              urls={urls}
              setUrls={setUrls}
              topic={topic}
              setTopic={setTopic}
              isLoading={isLoading}
              status={status}
              progress={progress}
              onExtract={onExtract}
            />
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
