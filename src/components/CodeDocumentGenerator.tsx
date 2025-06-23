
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileCode, Download } from 'lucide-react';
import { generateCompleteCodeDocument } from '@/utils/generateCodeDocument';
import { useState } from 'react';

export const CodeDocumentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateCompleteCodeDocument();
    } catch (error) {
      console.error('Error generating code document:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <FileCode className="w-5 h-5 mr-2" />
      {isGenerating ? 'Generating...' : 'Download Complete Codebase'}
      <Download className="w-4 h-4 ml-2" />
    </Button>
  );
};
