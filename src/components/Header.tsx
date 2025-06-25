
import { FileText, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { FeatureReportButton } from "@/components/FeatureReportButton";
import { CodeDocumentGenerator } from "@/components/CodeDocumentGenerator";

export const Header = () => {
  const { t } = useLanguage();

  return (
    <div className="text-center animate-fade-in">
      <div className="flex justify-end mb-4 gap-2">
        <CodeDocumentGenerator />
        <FeatureReportButton />
        <LanguageSelector />
      </div>
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="relative">
          <FileText className="w-12 h-12 text-blue-600" />
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {t('header.title')}
        </h1>
      </div>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        {t('header.subtitle')}
      </p>
      <div className="mt-4 text-sm text-slate-500 font-medium">
        {t('header.createdBy')} <span className="text-blue-600 font-semibold">Rahul Sah</span>
      </div>
      <div className="mt-2 text-xs text-slate-400 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-full inline-block">
        Powered by <span className="font-semibold text-purple-600">Llama 3 AI</span>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
        <div className="h-1 w-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
      </div>
    </div>
  );
};
