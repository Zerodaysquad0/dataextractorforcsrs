
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
}

const getSuggestedTopics = (language: string) => {
  const suggestions = {
    en: [
      'Environmental sustainability',
      'Corporate social responsibility',
      'Community engagement',
      'Ethical business practices',
      'Diversity and inclusion',
      'Supply chain management',
      'Climate action',
      'Employee wellbeing'
    ],
    hi: [
      'पर्यावरणीय स्थिरता',
      'कॉर्पोरेट सामाजिक जिम्मेदारी',
      'सामुदायिक सहभागिता',
      'नैतिक व्यावसायिक प्रथाएं',
      'विविधता और समावेशन',
      'आपूर्ति श्रृंखला प्रबंधन',
      'जलवायु कार्रवाई',
      'कर्मचारी कल्याण'
    ],
    ta: [
      'சுற்றுச்சூழல் நிலைத்தன்மை',
      'கॉर्पोरेट் சமூக பொறுப்பு',
      'சமூக ஈடுபாடு',
      'நெறிமுறை வணிக நடைமுறைகள்',
      'பன்முகத்தன்மை மற்றும் உள்ளடக்கம்',
      'விநியோக சங்கிலி நிர்வாகம்',
      'காலநிலை நடவடிக்கை',
      'பணியாளர் நலன்'
    ],
    te: [
      'పర్యావరణ స్థిరత్వం',
      'కార్పొరేట్ సామాజిక బాధ్యత',
      'కమ్యూనిటీ నిమగ్నత',
      'నైతిక వ్యాపార అభ్యాసాలు',
      'వైవిధ్యం మరియు చేరిక',
      'సరఫరా గొలుసు నిర్వహణ',
      'వాతావరణ చర్య',
      'ఉద్యోగి సంక్షేమం'
    ],
    mr: [
      'पर्यावरणीय टिकाऊपणा',
      'कॉर्पोरेट सामाजिक जबाबदारी',
      'समुदायिक सहभाग',
      'नैतिक व्यावसायिक प्रथा',
      'विविधता आणि समावेश',
      'पुरवठा साखळी व्यवस्थापन',
      'हवामान कृती',
      'कर्मचारी कल्याण'
    ]
  };
  return suggestions[language] || suggestions.en;
};

export const TopicInput = ({ topic, setTopic }: TopicInputProps) => {
  const { t, currentLanguage } = useLanguage();
  const suggestedTopics = getSuggestedTopics(currentLanguage);

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        {t('topic.title')}
      </h3>
      
      <div className="space-y-4">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('topic.placeholder')}
          className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 text-base py-3"
        />
        
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">{t('topic.quickSuggestions')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setTopic(suggestion)}
                className="text-xs h-7 px-3 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-slate-500">
          {t('topic.description')}
        </p>
      </div>
    </Card>
  );
};
