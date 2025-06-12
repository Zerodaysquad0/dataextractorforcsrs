
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number;
  status: string;
}

export const ProgressIndicator = ({ progress, status }: ProgressIndicatorProps) => {
  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-slate-700">{status}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-slate-200"
          />
        </div>
      </div>
    </Card>
  );
};
