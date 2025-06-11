
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: string;
  isLoading: boolean;
}

export const StatusIndicator = ({ status, isLoading }: StatusIndicatorProps) => {
  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    }
    if (status.includes('✅')) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (status.includes('Error') || status.includes('Please enter')) {
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    }
    return <CheckCircle className="w-5 h-5 text-slate-400" />;
  };

  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg animate-fade-in">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <p className="text-sm font-medium text-slate-700">{status}</p>
      </div>
    </Card>
  );
};
