
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileDown, Copy, CheckCircle, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadAsText } from '@/utils/downloadText';
import { downloadAsPDF } from '@/utils/downloadPDF';
import { downloadAsWord } from '@/utils/downloadWord';

interface ResultsAreaProps {
  results: string;
  isLoading: boolean;
  topic?: string;
  images?: string[];
}

export const ResultsArea = ({ results, isLoading, topic, images = [] }: ResultsAreaProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(results);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Results have been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadText = () => {
    downloadAsText(results, 'data-extraction-results.txt');
    toast({
      title: "Download started",
      description: "Your results are being downloaded as a text file",
    });
  };

  const handleDownloadPDF = () => {
    downloadAsPDF(results, 'data-extraction-results.pdf', "Extraction Results", topic || "", images);
    toast({
      title: "Download started",
      description: "Your results are being downloaded as a PDF file",
    });
  };

  const handleDownloadWord = () => {
    downloadAsWord(results, 'data-extraction-results.docx', "Extraction Results", topic || "", images);
    toast({
      title: "Download started",
      description: "Your results are being downloaded as a Word file",
    });
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileDown className="w-5 h-5 text-blue-600" />
          Extraction Results
        </h3>
        {results && !isLoading && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadText}
              className="hover:bg-green-50 hover:border-green-300 transition-colors"
              title="Download as text file"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadWord}
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              title="Download as Word file"
            >
              <FileDown className="w-4 h-4" /> <span className="text-xs">Word</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
              title="Download as PDF"
            >
              <FileDown className="w-4 h-4" /> <span className="text-xs">PDF</span>
            </Button>
          </div>
        )}
      </div>
      <div className="relative h-[600px] overflow-y-auto pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Processing your sources...</p>
            <p className="text-sm">Extracting and analyzing content with AI</p>
          </div>
        ) : (
          <>
            <Textarea
              value={results || 'Results will appear here after extraction...\n\nThe AI will analyze your PDFs and websites to extract relevant information about your specified topic.'}
              readOnly
              className="h-full resize-none bg-slate-900 text-green-400 font-mono text-sm border-slate-700 focus:border-slate-600 focus:ring-slate-600/20"
              placeholder="Results will appear here after extraction..."
            />
            {images?.length ? (
              <div className="mt-4">
                <h4 className="text-base font-semibold mb-2 text-slate-800">Extracted Images</h4>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={img + i} className="flex flex-col items-start max-w-xs">
                      <img
                        src={img}
                        alt={`Extracted ${i + 1}`}
                        className="max-h-40 max-w-xs object-contain border rounded shadow"
                        loading="lazy"
                      />
                      <a
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs break-all text-blue-700 underline hover:text-blue-900"
                        title="Open or download image"
                      >
                        {img}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
};
