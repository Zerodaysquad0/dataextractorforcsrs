import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StructuredTableView } from '@/components/StructuredTableView';
import { downloadAsText, downloadAsPDF, downloadAsWord } from '@/utils/downloadUtils';
import { Download, FileText, FileImage, Table, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsAreaProps {
  results: string;
  isLoading: boolean;
  topic: string;
  images?: string[];
  structuredData?: Array<Record<string, any>>;
  source?: string;
}

export const ResultsArea: React.FC<ResultsAreaProps> = ({
  results,
  isLoading,
  topic,
  images = [],
  structuredData = [],
  source
}) => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'summary' | 'table'>('summary');

  const handleDownload = async (format: 'text' | 'pdf' | 'word') => {
    if (!results.trim()) {
      toast({
        title: "No content to download",
        description: "Please extract some content first",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = topic || 'extraction-results';
      
      switch (format) {
        case 'text':
          downloadAsText(results, filename);
          break;
        case 'pdf':
          await downloadAsPDF(results, filename);
          break;
        case 'word':
          await downloadAsWord(results, filename);
          break;
      }
      
      toast({
        title: "Download successful",
        description: `${format.toUpperCase()} file has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: `Unable to generate ${format.toUpperCase()} file`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Extraction Results</h3>
        
        {results && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDownload('text')}>
              <FileText className="w-4 h-4 mr-1" />
              TXT
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('word')}>
              <FileText className="w-4 h-4 mr-1" />
              Word
            </Button>
          </div>
        )}
      </div>

      {results ? (
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'summary' | 'table')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Summary
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Structured Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="prose prose-slate max-w-none space-y-4">
              <div 
                className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: results
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '→')
                    .replace(/\n/g, '<br/>')
                }}
              />
              
              {images.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    Extracted Images ({images.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                        <img 
                          src={img} 
                          alt={`Extracted ${idx + 1}`}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="p-2 bg-slate-50 text-xs text-slate-600">
                          Image {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <StructuredTableView
              data={structuredData}
              title={topic || 'Extracted Data'}
              source={source}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Your extracted content will appear here...</p>
          <p className="text-sm mt-2">Upload PDFs or enter website URLs to get started</p>
        </div>
      )}
    </div>
  );
};
