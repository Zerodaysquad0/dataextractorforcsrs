
import { useState } from 'react';
import { Header } from '@/components/Header';
import { SourceSelector } from '@/components/SourceSelector';
import { FileUploader } from '@/components/FileUploader';
import { UrlInput } from '@/components/UrlInput';
import { TopicInput } from '@/components/TopicInput';
import { ExtractButton } from '@/components/ExtractButton';
import { ResultsArea } from '@/components/ResultsArea';
import { StatusIndicator } from '@/components/StatusIndicator';

export type SourceType = 'PDF' | 'Website' | 'Both';

const Index = () => {
  const [sourceType, setSourceType] = useState<SourceType>('Both');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState('');
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready to extract CSR content');

  const handleExtract = async () => {
    if (!topic.trim()) {
      setStatus('Please enter a topic');
      return;
    }

    setIsLoading(true);
    setStatus('Extracting content from sources...');
    
    // Simulate API call - replace with actual implementation
    setTimeout(() => {
      const mockResults = `Source Analysis for Topic: ${topic}

--- FILE: example.pdf ---
Corporate Social Responsibility Overview: This document outlines comprehensive CSR initiatives including environmental sustainability programs, community engagement activities, and ethical business practices. The company has implemented carbon-neutral operations and supports local education programs.

Key insights:
- 40% reduction in carbon emissions over 5 years
- $2M invested in community development programs
- 100% renewable energy usage in all facilities
- Partnership with 15 local educational institutions

--- WEBSITE: https://example.com/csr ---
CSR Implementation Strategy: The organization demonstrates commitment to sustainable business practices through various environmental and social initiatives. Focus areas include climate action, diversity and inclusion, and responsible supply chain management.

Key insights:
- Zero-waste manufacturing processes implemented
- 50% increase in diverse supplier partnerships
- Employee volunteer program with 95% participation
- Transparent sustainability reporting published quarterly`;

      setResults(mockResults);
      setStatus('✅ Extraction complete');
      setIsLoading(false);
    }, 3000);
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
            
            <StatusIndicator 
              status={status}
              isLoading={isLoading}
            />
          </div>
          
          {/* Right Panel - Results */}
          <div className="xl:sticky xl:top-8 xl:h-fit">
            <ResultsArea 
              results={results}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
