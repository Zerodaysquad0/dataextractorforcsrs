
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileText, Globe, Layers } from 'lucide-react';
import type { SourceType } from '@/pages/Index';

interface SourceSelectorProps {
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
}

export const SourceSelector = ({ sourceType, setSourceType }: SourceSelectorProps) => {
  const options = [
    { value: 'PDF', label: 'PDF Files', icon: FileText, description: 'Extract from PDF documents' },
    { value: 'Website', label: 'Websites', icon: Globe, description: 'Extract from web pages' },
    { value: 'Both', label: 'Both Sources', icon: Layers, description: 'Extract from PDFs and websites' },
  ];

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-blue-600" />
        Source Type
      </h3>
      <RadioGroup value={sourceType} onValueChange={(value) => setSourceType(value as SourceType)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {options.map((option) => (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className="flex flex-col items-center p-4 rounded-xl border-2 border-slate-200 bg-white/50 hover:bg-white/80 hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50/80 cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <option.icon className="w-8 h-8 text-slate-600 peer-checked:text-blue-600 mb-2" />
                <span className="font-medium text-slate-800">{option.label}</span>
                <span className="text-xs text-slate-500 text-center mt-1">{option.description}</span>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </Card>
  );
};
