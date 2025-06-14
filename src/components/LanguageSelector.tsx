
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Languages, Check } from 'lucide-react';
import { useLanguage, type Language } from '@/context/LanguageContext';

const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta' as Language, name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te' as Language, name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी' },
];

export const LanguageSelector = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 bg-white/80 hover:bg-white/90 border-white/40 shadow-md"
        >
          <Languages className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline-block">{currentLang?.nativeName}</span>
          <span className="sm:hidden">{currentLang?.code.toUpperCase()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-auto px-2 py-2"
              onClick={() => {
                setLanguage(language.code);
                setOpen(false);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{language.name}</span>
                </div>
                {currentLanguage === language.code && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
