
import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useExtraction } from '@/hooks/useExtraction';

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
  } = useExtraction();

  const onExtract = () => {
    handleExtract(topic, sourceType, selectedFiles, urls);
  };

  return (
    <AppLayout
      sourceType={sourceType}
      setSourceType={setSourceType}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
      urls={urls}
      setUrls={setUrls}
      topic={topic}
      setTopic={setTopic}
      results={results}
      isLoading={isLoading}
      status={status}
      progress={progress}
      images={images}
      onExtract={onExtract}
    />
  );
};

export default Index;
