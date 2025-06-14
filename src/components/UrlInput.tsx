
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface UrlInputProps {
  urls: string;
  setUrls: (urls: string) => void;
  disabled?: boolean;
}

export const UrlInput = ({ urls, setUrls, disabled }: UrlInputProps) => {
  const { t } = useLanguage();

  return (
    <Card className={`p-6 bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 ${disabled ? 'opacity-50' : 'animate-scale-in'}`}>
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-600" />
        {t('urlInput.title')}
      </h3>
      
      <div className="space-y-2">
        <Textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          disabled={disabled}
          placeholder={t('urlInput.placeholder')}
          className="min-h-[120px] resize-none bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
        />
        <p className="text-xs text-slate-500">
          {t('urlInput.description')}
        </p>
      </div>
    </Card>
  );
};
