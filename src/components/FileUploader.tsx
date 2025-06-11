
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploaderProps {
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  disabled?: boolean;
}

export const FileUploader = ({ selectedFiles, setSelectedFiles, disabled }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={`p-6 bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 ${disabled ? 'opacity-50' : 'animate-scale-in'}`}>
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        PDF Documents
      </h3>
      
      <div className="space-y-4">
        <Button
          onClick={triggerFileSelect}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5 mr-2" />
          Select PDF Files
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 font-medium">
              Selected Files ({selectedFiles.length}):
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50/70 rounded-lg border border-blue-200/50 animate-fade-in"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
