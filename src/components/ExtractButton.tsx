
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ExtractButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const ExtractButton = ({ onClick, isLoading }: ExtractButtonProps) => {
  const { t } = useLanguage();

  return (
    <div className="animate-scale-in">
      <Button
        onClick={onClick}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transform"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            {t('extract.loading')}
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6 mr-3" />
            {t('extract.button')}
          </>
        )}
      </Button>
    </div>
  );
};
