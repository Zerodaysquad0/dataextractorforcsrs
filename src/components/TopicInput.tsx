
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
}

const suggestedTopics = [
  'Environmental sustainability',
  'Corporate social responsibility',
  'Community engagement',
  'Ethical business practices',
  'Diversity and inclusion',
  'Supply chain management',
  'Climate action',
  'Employee wellbeing'
];

export const TopicInput = ({ topic, setTopic }: TopicInputProps) => {
  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        Research Topic
      </h3>
      
      <div className="space-y-4">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Environmental sustainability, Community engagement, Ethical practices"
          className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 text-base py-3"
        />
        
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">Quick suggestions:</p>
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
          Specify the topic you want to research and extract information about from your sources
        </p>
      </div>
    </Card>
  );
};
