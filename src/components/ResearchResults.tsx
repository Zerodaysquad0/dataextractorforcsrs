
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Copy, ExternalLink, Download, RefreshCw, TrendingUp, Table as TableIcon, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ResearchResult } from './AIResearch';

interface ResearchResultsProps {
  results: ResearchResult;
  onNewResearch: () => void;
}

const CHART_COLORS = ['#8A33FF', '#00BFA6', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

export const ResearchResults = ({ results, onNewResearch }: ResearchResultsProps) => {
  const [expandedTable, setExpandedTable] = useState(false);
  const [expandedChart, setExpandedChart] = useState(false);
  const { toast } = useToast();

  const handleCopyInsight = async () => {
    const textToCopy = `${results.headline}\n\n${results.summary}\n\nSources:\n${results.sources.map((s, i) => `${i + 1}. ${s.title} - ${s.url}`).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Insight Copied",
        description: "Research insight copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleExportTable = () => {
    if (!results.tableData) return;

    const headers = Object.keys(results.tableData[0]);
    const csvContent = [
      headers.join(','),
      ...results.tableData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-data-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Table data exported as CSV",
    });
  };

  const renderChart = () => {
    if (!results.chartData) return null;

    const commonProps = {
      width: '100%',
      height: expandedChart ? 400 : 250,
      data: results.chartData,
    };

    switch (results.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              {Object.keys(results.chartData[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              {Object.keys(results.chartData[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={results.chartData}
                cx="50%"
                cy="50%"
                outerRadius={expandedChart ? 150 : 100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {results.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Insight Card */}
      <Card className="bg-[#1A1A1A] border border-gray-800 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-white mb-2">{results.headline}</CardTitle>
              <Badge variant="secondary" className="bg-[#00BFA6]/20 text-[#00BFA6] border-[#00BFA6]/30 text-xs">
                Research Complete
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInsight}
                className="hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNewResearch}
                className="hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{results.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Visualization */}
      {(results.tableData || results.chartData) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Table Data */}
          {results.tableData && (
            <Card className="bg-[#1A1A1A] border border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <TableIcon className="w-5 h-5 text-[#8A33FF]" />
                    Data Table
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportTable}
                      className="hover:bg-gray-800 text-gray-400 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTable(!expandedTable)}
                      className="hover:bg-gray-800 text-gray-400 hover:text-white"
                    >
                      {expandedTable ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`overflow-auto ${expandedTable ? 'max-h-96' : 'max-h-48'}`}>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        {Object.keys(results.tableData[0] || {}).map((header) => (
                          <TableHead key={header} className="text-gray-300 font-semibold">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.tableData.slice(0, expandedTable ? undefined : 5).map((row, index) => (
                        <TableRow key={index} className="border-gray-700 hover:bg-gray-800/50">
                          {Object.values(row).map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="text-gray-300">
                              {String(cell)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart Data */}
          {results.chartData && (
            <Card className="bg-[#1A1A1A] border border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#00BFA6]" />
                    Data Visualization
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedChart(!expandedChart)}
                    className="hover:bg-gray-800 text-gray-400 hover:text-white"
                  >
                    {expandedChart ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sources */}
      <Card className="bg-[#1A1A1A] border border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">Sources & Citations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.sources.map((source, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#0F0F0F] border border-gray-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8A33FF]/20 flex items-center justify-center text-[#8A33FF] text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{source.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{source.snippet}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs text-[#00BFA6] border-[#00BFA6]/30">
                      Verified Source
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
