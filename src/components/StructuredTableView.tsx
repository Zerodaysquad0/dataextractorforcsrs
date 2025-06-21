
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileSpreadsheet } from 'lucide-react';
import { downloadAsExcel } from '@/utils/downloadExcel';
import { useToast } from '@/hooks/use-toast';

interface StructuredTableViewProps {
  data: Array<Record<string, any>>;
  title: string;
  source?: string;
  onExportExcel?: () => void;
}

export const StructuredTableView: React.FC<StructuredTableViewProps> = ({
  data,
  title,
  source,
  onExportExcel
}) => {
  const { toast } = useToast();

  const handleExcelExport = async () => {
    try {
      await downloadAsExcel(data, title, source);
      toast({
        title: "Export successful",
        description: "Excel file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to generate Excel file",
        variant: "destructive",
      });
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No structured data available</p>
        <p className="text-sm">Upload content to generate AI-powered tables</p>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="space-y-4">
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {source && (
            <p className="text-sm text-slate-600">Source: {source}</p>
          )}
        </div>
        <Button 
          onClick={handleExcelExport}
          variant="outline" 
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 border-0"
        >
          <Download className="w-4 h-4 mr-2" />
          Download as Excel
        </Button>
      </div>

      {/* Responsive Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <ScrollArea className="w-full">
          <div className="min-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <TableHead className="font-semibold text-slate-700 w-16 text-center">S.No</TableHead>
                  {headers.map((header) => (
                    <TableHead key={header} className="font-semibold text-slate-700 min-w-[120px]">
                      {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow 
                    key={index} 
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                  >
                    <TableCell className="text-center font-medium text-slate-600">
                      {index + 1}
                    </TableCell>
                    {headers.map((header) => (
                      <TableCell 
                        key={header} 
                        className="text-slate-700 max-w-xs break-words"
                      >
                        {row[header] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Summary */}
      <div className="block sm:hidden mt-4 p-4 bg-slate-50 rounded-lg">
        <p className="text-sm text-slate-600">
          Showing {data.length} records with {headers.length} fields each. 
          Scroll horizontally to view all columns.
        </p>
      </div>
    </div>
  );
};
