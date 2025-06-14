
import React from 'react';
import { SourceSelector } from '@/components/SourceSelector';
import { FileUploader } from '@/components/FileUploader';
import { UrlInput } from '@/components/UrlInput';
import { TopicInput } from '@/components/TopicInput';
import { ExtractButton } from '@/components/ExtractButton';
import { StatusIndicator } from '@/components/StatusIndicator';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import type { SourceType } from '@/pages/Index';

interface InputControlsProps {
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  urls: string;
  setUrls: (urls: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  isLoading: boolean;
  status: string;
  progress: number;
  onExtract: () => void;
}

export const InputControls = ({
  sourceType,
  setSourceType,
  selectedFiles,
  setSelectedFiles,
  urls,
  setUrls,
  topic,
  setTopic,
  isLoading,
  status,
  progress,
  onExtract,
}: InputControlsProps) => {
  return (
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
  );
};
