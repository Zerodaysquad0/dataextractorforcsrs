
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileDown, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsAreaProps {
  results: string;
  isLoading: boolean;
}

export const ResultsArea = ({ results, isLoading }: ResultsAreaProps) => {
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

  const handleDownload = () => {
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csr-extraction-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your results are being downloaded",
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
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="relative h-[600px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Processing your sources...</p>
            <p className="text-sm">This may take a few moments</p>
          </div>
        ) : (
          <Textarea
            value={results || 'Results will appear here after extraction...'}
            readOnly
            className="h-full resize-none bg-slate-900 text-green-400 font-mono text-sm border-slate-700 focus:border-slate-600 focus:ring-slate-600/20"
            placeholder="Results will appear here after extraction..."
          />
        )}
      </div>
    </Card>
  );
};
