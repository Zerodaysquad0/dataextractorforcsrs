
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, Sparkles, Copy, ExternalLink, Download, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { ResearchResults } from './ResearchResults';
import { performAIResearch } from '@/services/aiResearchService';

export interface ResearchResult {
  query: string;
  headline: string;
  summary: string;
  tableData?: Array<Record<string, any>>;
  chartData?: Array<Record<string, any>>;
  chartType?: 'bar' | 'line' | 'pie';
  sources: Array<{
    title: string;
    url: string;
    favicon?: string;
    snippet: string;
  }>;
  timestamp: string;
}

export const AIResearch = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult | null>(null);
  const [status, setStatus] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleResearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a research question",
        description: "Type a question you'd like me to research for you",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setStatus('🧠 Analyzing your question...');
    
    try {
      const result = await performAIResearch({
        query: query.trim(),
        onProgress: (progress, statusText) => {
          setStatus(statusText);
        },
      });

      if (result.success && result.data) {
        setResults(result.data);
        toast({
          title: "Research Complete!",
          description: "Found valuable insights for your question",
        });
      } else {
        throw new Error(result.error || 'Research failed');
      }
    } catch (error) {
      console.error('Research error:', error);
      toast({
        title: "Research Failed",
        description: "Unable to complete research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
      toast({
        title: "Query Copied",
        description: "Research question copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="p-6 bg-[#1A1A1A] border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Brain className="w-8 h-8 text-[#8A33FF]" />
            <Sparkles className="w-4 h-4 text-[#00BFA6] absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Research Assistant</h2>
            <p className="text-gray-400">Ask questions, get structured insights with citations</p>
          </div>
          <Badge variant="secondary" className="ml-auto bg-[#8A33FF]/20 text-[#8A33FF] border-[#8A33FF]/30">
            Premium
          </Badge>
        </div>

        {/* Query Input */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything... e.g., 'How many new startups launched in India in 2025?' or 'What are CSR spending trends for Tata Steel?'"
              className="min-h-[100px] bg-[#0F0F0F] border-gray-700 text-white placeholder:text-gray-500 resize-none rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleResearch();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyQuery}
                  className="h-8 w-8 p-0 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[#00BFA6] border-[#00BFA6]/30 bg-[#00BFA6]/10">
                <Search className="w-3 h-3 mr-1" />
                Web Search
              </Badge>
              <Badge variant="outline" className="text-[#8A33FF] border-[#8A33FF]/30 bg-[#8A33FF]/10">
                <TrendingUp className="w-3 h-3 mr-1" />
                Data Analysis
              </Badge>
            </div>
            <Button
              onClick={handleResearch}
              disabled={isLoading || !query.trim()}
              className="bg-gradient-to-r from-[#8A33FF] to-[#00BFA6] hover:from-[#7A2FE6] hover:to-[#00A693] text-white px-6 rounded-full"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Researching...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Research
                </>
              )}
            </Button>
          </div>

          {isLoading && status && (
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-[#0F0F0F] rounded-lg p-3">
              <div className="w-4 h-4 border-2 border-[#8A33FF]/30 border-t-[#8A33FF] rounded-full animate-spin" />
              {status}
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      {results && (
        <ResearchResults 
          results={results} 
          onNewResearch={() => {
            setResults(null);
            setQuery('');
          }}
        />
      )}

      {/* Sample Questions */}
      {!results && !isLoading && (
        <Card className="p-6 bg-[#1A1A1A] border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Sample Research Questions</h3>
          <div className="grid gap-3">
            {[
              "How many new startups have launched in India in 2025 so far?",
              "Give CSR spending trends for Tata Steel in the last 3 years",
              "What are the top 5 AI companies working in education sector?",
              "Latest funding rounds in fintech sector this month"
            ].map((sample, index) => (
              <button
                key={index}
                onClick={() => setQuery(sample)}
                className="text-left p-3 rounded-lg bg-[#0F0F0F] hover:bg-gray-800 transition-colors text-gray-300 hover:text-white border border-gray-700 hover:border-[#8A33FF]/30"
              >
                <span className="text-[#8A33FF] mr-2">→</span>
                {sample}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
