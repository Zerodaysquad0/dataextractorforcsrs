
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'mr';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.title': 'Data Extractor',
    'header.subtitle': 'Extract and analyze data content from PDFs and websites with AI-powered insights',
    'header.createdBy': 'Created by',
    
    // Source Selector
    'source.title': 'Source Type',
    'source.pdf': 'PDF Files',
    'source.website': 'Websites',
    'source.both': 'Both Sources',
    'source.pdfDesc': 'Extract from PDF documents',
    'source.websiteDesc': 'Extract from web pages',
    'source.bothDesc': 'Extract from PDFs and websites',
    
    // File Uploader
    'fileUpload.title': 'Upload PDF Files',
    'fileUpload.dragDrop': 'Drag and drop PDF files here, or click to select',
    'fileUpload.supportedFormats': 'Supported formats: PDF (max 10MB per file)',
    'fileUpload.selectedFiles': 'Selected Files',
    'fileUpload.remove': 'Remove',
    
    // URL Input
    'urlInput.title': 'Website URLs',
    'urlInput.placeholder': 'Enter website URLs (one per line)\nhttps://example.com/csr\nhttps://company.com/sustainability',
    'urlInput.description': 'Enter one URL per line. Make sure URLs include http:// or https://',
    
    // Topic Input
    'topic.title': 'Research Topic',
    'topic.placeholder': 'e.g., Environmental sustainability, Community engagement, Ethical practices',
    'topic.quickSuggestions': 'Quick suggestions:',
    'topic.description': 'Specify the topic you want to research and extract information about from your sources',
    
    // Extract Button
    'extract.button': 'Extract from All Sources',
    'extract.loading': 'Extracting Content...',
    
    // Results
    'results.title': 'Extraction Results',
    'results.processing': 'Processing your sources...',
    'results.processingDesc': 'Extracting and analyzing content with AI',
    'results.placeholder': 'Results will appear here after extraction...\n\nThe AI will analyze your PDFs and websites to extract relevant information about your specified topic.',
    'results.extractedImages': 'Extracted Images',
    'results.copyToClipboard': 'Copy to clipboard',
    'results.downloadText': 'Download as text file',
    'results.downloadWord': 'Download as Word file',
    'results.downloadPDF': 'Download as PDF',
    'results.shareEmail': 'Share via Email',
    
    // Toast Messages
    'toast.copied': 'Copied to clipboard',
    'toast.copiedDesc': 'Results have been copied to your clipboard',
    'toast.copyFailed': 'Copy failed',
    'toast.copyFailedDesc': 'Failed to copy to clipboard',
    'toast.downloadStarted': 'Download started',
    'toast.downloadTextDesc': 'Your results are being downloaded as a text file',
    'toast.downloadPDFDesc': 'Your results are being downloaded as a PDF file',
    'toast.downloadWordDesc': 'Your results are being downloaded as a Word file',
  },
  hi: {
    // Header
    'header.title': 'डेटा एक्स्ट्रैक्टर',
    'header.subtitle': 'AI-संचालित अंतर्दृष्टि के साथ PDF और वेबसाइटों से डेटा सामग्री निकालें और विश्लेषण करें',
    'header.createdBy': 'द्वारा बनाया गया',
    
    // Source Selector
    'source.title': 'स्रोत प्रकार',
    'source.pdf': 'PDF फाइलें',
    'source.website': 'वेबसाइटें',
    'source.both': 'दोनों स्रोत',
    'source.pdfDesc': 'PDF दस्तावेजों से निकालें',
    'source.websiteDesc': 'वेब पेजों से निकालें',
    'source.bothDesc': 'PDF और वेबसाइटों से निकालें',
    
    // File Uploader
    'fileUpload.title': 'PDF फाइलें अपलोड करें',
    'fileUpload.dragDrop': 'PDF फाइलें यहाँ खींचें और छोड़ें, या चुनने के लिए क्लिक करें',
    'fileUpload.supportedFormats': 'समर्थित प्रारूप: PDF (प्रति फाइल अधिकतम 10MB)',
    'fileUpload.selectedFiles': 'चयनित फाइलें',
    'fileUpload.remove': 'हटाएं',
    
    // URL Input
    'urlInput.title': 'वेबसाइट URLs',
    'urlInput.placeholder': 'वेबसाइट URLs दर्ज करें (प्रति लाइन एक)\nhttps://example.com/csr\nhttps://company.com/sustainability',
    'urlInput.description': 'प्रति लाइन एक URL दर्ज करें। सुनिश्चित करें कि URLs में http:// या https:// शामिल है',
    
    // Topic Input
    'topic.title': 'अनुसंधान विषय',
    'topic.placeholder': 'जैसे, पर्यावरणीय स्थिरता, सामुदायिक सहभागिता, नैतिक प्रथाएं',
    'topic.quickSuggestions': 'त्वरित सुझाव:',
    'topic.description': 'उस विषय को निर्दिष्ट करें जिसके बारे में आप अपने स्रोतों से जानकारी निकालना चाहते हैं',
    
    // Extract Button
    'extract.button': 'सभी स्रोतों से निकालें',
    'extract.loading': 'सामग्री निकाली जा रही है...',
    
    // Results
    'results.title': 'निष्कर्षण परिणाम',
    'results.processing': 'आपके स्रोतों को संसाधित कर रहे हैं...',
    'results.processingDesc': 'AI के साथ सामग्री निकाली और विश्लेषित की जा रही है',
    'results.placeholder': 'निष्कर्षण के बाद परिणाम यहाँ दिखाई देंगे...\n\nAI आपके PDF और वेबसाइटों का विश्लेषण करके आपके निर्दिष्ट विषय के बारे में प्रासंगिक जानकारी निकालेगा।',
    'results.extractedImages': 'निकाली गई छवियां',
    'results.copyToClipboard': 'क्लिपबोर्ड में कॉपी करें',
    'results.downloadText': 'टेक्स्ट फाइल के रूप में डाउनलोड करें',
    'results.downloadWord': 'वर्ड फाइल के रूप में डाउनलोड करें',
    'results.downloadPDF': 'PDF के रूप में डाउनलोड करें',
    'results.shareEmail': 'ईमेल के माध्यम से साझा करें',
    
    // Toast Messages
    'toast.copied': 'क्लिपबोर्ड में कॉपी किया गया',
    'toast.copiedDesc': 'परिणाम आपके क्लिपबोर्ड में कॉपी कर दिए गए हैं',
    'toast.copyFailed': 'कॉपी विफल',
    'toast.copyFailedDesc': 'क्लिपबोर्ड में कॉपी करने में विफल',
    'toast.downloadStarted': 'डाउनलोड शुरू',
    'toast.downloadTextDesc': 'आपके परिणाम टेक्स्ट फाइल के रूप में डाउनलोड हो रहे हैं',
    'toast.downloadPDFDesc': 'आपके परिणाम PDF फाइल के रूप में डाउनलोड हो रहे हैं',
    'toast.downloadWordDesc': 'आपके परिणाम वर्ड फाइल के रूप में डाउनलोड हो रहे हैं',
  },
  ta: {
    // Header
    'header.title': 'தரவு பிரித்தெடுப்பான்',
    'header.subtitle': 'AI-இயக்கப்படும் நுண்ணறிவுகளுடன் PDF மற்றும் வலைத்தளங்களிலிருந்து தரவு உள்ளடக்கத்தை பிரித்தெடுத்து பகுப்பாய்வு செய்யுங்கள்',
    'header.createdBy': 'உருவாக்கியவர்',
    
    // Source Selector
    'source.title': 'மூல வகை',
    'source.pdf': 'PDF கோப்புகள்',
    'source.website': 'வலைத்தளங்கள்',
    'source.both': 'இரண்டு மூலங்களும்',
    'source.pdfDesc': 'PDF ஆவணங்களிலிருந்து பிரித்தெடுக்கவும்',
    'source.websiteDesc': 'வலை பக்கங்களிலிருந்து பிரித்தெடுக்கவும்',
    'source.bothDesc': 'PDF மற்றும் வலைத்தளங்களிலிருந்து பிரித்தெடுக்கவும்',
    
    // File Uploader
    'fileUpload.title': 'PDF கோப்புகளை பதிவேற்றுக',
    'fileUpload.dragDrop': 'PDF கோப்புகளை இங்கே இழுத்து விடுங்கள், அல்லது தேர்ந்தெடுக்க கிளிக் செய்யுங்கள்',
    'fileUpload.supportedFormats': 'ஆதரிக்கப்படும் வடிவங்கள்: PDF (ஒரு கோப்புக்கு அதிகபட்சம் 10MB)',
    'fileUpload.selectedFiles': 'தேர்ந்தெடுக்கப்பட்ட கோப்புகள்',
    'fileUpload.remove': 'அகற்று',
    
    // URL Input
    'urlInput.title': 'வலைத்தள URLs',
    'urlInput.placeholder': 'வலைத்தள URLs ஐ உள்ளிடுக (ஒரு வரிக்கு ஒன்று)\nhttps://example.com/csr\nhttps://company.com/sustainability',
    'urlInput.description': 'ஒரு வரிக்கு ஒரு URL உள்ளிடுக. URLs இல் http:// அல்லது https:// இருப்பதை உறுதிப்படுத்துக',
    
    // Topic Input
    'topic.title': 'ஆராய்ச்சி தலைப்பு',
    'topic.placeholder': 'எ.கா., சுற்றுச்சூழல் நிலைத்தன்மை, சமூக ஈடுபாடு, நெறிமுறை நடைமுறைகள்',
    'topic.quickSuggestions': 'விரைவு பரிந்துரைகள்:',
    'topic.description': 'உங்கள் மூலங்களிலிருந்து நீங்கள் ஆராய்ச்சி செய்து தகவல்களை பிரித்தெடுக்க விரும்பும் தலைப்பை குறிப்பிடுக',
    
    // Extract Button
    'extract.button': 'அனைத்து மூலங்களிலிருந்தும் பிரித்தெடுக்கவும்',
    'extract.loading': 'உள்ளடக்கம் பிரித்தெடுக்கப்படுகிறது...',
    
    // Results
    'results.title': 'பிரித்தெடுத்தல் முடிவுகள்',
    'results.processing': 'உங்கள் மூலங்களை செயலாக்குகிறோம்...',
    'results.processingDesc': 'AI உடன் உள்ளடக்கத்தை பிரித்தெடுத்து பகுப்பாய்வு செய்கிறோம்',
    'results.placeholder': 'பிரித்தெடுத்தலுக்குப் பிறகு முடிவுகள் இங்கே தோன்றும்...\n\nAI உங்கள் PDF மற்றும் வலைத்தளங்களை பகுப்பாய்வு செய்து உங்கள் குறிப்பிட்ட தலைப்பு பற்றிய தொடர்புடைய தகவல்களை பிரித்தெடுக்கும்.',
    'results.extractedImages': 'பிரித்தெடுக்கப்பட்ட படங்கள்',
    'results.copyToClipboard': 'கிளிப்போர்டில் நகலெடுக்கவும்',
    'results.downloadText': 'உரை கோப்பாக பதிவிறக்கவும்',
    'results.downloadWord': 'Word கோப்பாக பதிவிறக்கவும்',
    'results.downloadPDF': 'PDF ஆக பதிவிறக்கவும்',
    'results.shareEmail': 'மின்னஞ்சல் மூலம் பகிரவும்',
    
    // Toast Messages
    'toast.copied': 'கிளிப்போர்டில் நகலெடுக்கப்பட்டது',
    'toast.copiedDesc': 'முடிவுகள் உங்கள் கிளிப்போர்டில் நகலெடுக்கப்பட்டுள்ளன',
    'toast.copyFailed': 'நகல் தோல்வியடைந்தது',
    'toast.copyFailedDesc': 'கிளிப்போர்டில் நகலெடுக்க முடியவில்லை',
    'toast.downloadStarted': 'பதிவிறக்கம் தொடங்கப்பட்டது',
    'toast.downloadTextDesc': 'உங்கள் முடிவுகள் உரை கோப்பாக பதிவிறக்கப்படுகின்றன',
    'toast.downloadPDFDesc': 'உங்கள் முடிவுகள் PDF கோப்பாக பதிவிறக்கப்படுகின்றன',
    'toast.downloadWordDesc': 'உங்கள் முடிவுகள் Word கோப்பாக பதிவிறக்கப்படுகின்றன',
  },
  te: {
    // Header
    'header.title': 'డేటా ఎక్స్‌ట్రాక్టర్',
    'header.subtitle': 'AI-ఆధారిత అంతర్దృష్టులతో PDF మరియు వెబ్‌సైట్లనుండి డేటా కంటెంట్‌ను సేకరించండి మరియు విశ్లేషించండి',
    'header.createdBy': 'రూపొందించినవారు',
    
    // Source Selector
    'source.title': 'మూల రకం',
    'source.pdf': 'PDF ఫైల్స్',
    'source.website': 'వెబ్‌సైట్లు',
    'source.both': 'రెండు మూలాలు',
    'source.pdfDesc': 'PDF పత్రాలనుండి సేకరించండి',
    'source.websiteDesc': 'వెబ్ పేజీలనుండి సేకరించండి',
    'source.bothDesc': 'PDF మరియు వెబ్‌సైట్లనుండి సేకరించండి',
    
    // File Uploader
    'fileUpload.title': 'PDF ఫైల్స్ అప్‌లోడ్ చేయండి',
    'fileUpload.dragDrop': 'PDF ఫైల్స్‌ను ఇక్కడ లాగి వదలండి, లేదా ఎంచుకోవడానికి క్లిక్ చేయండి',
    'fileUpload.supportedFormats': 'మద్దతు ఉన్న ఫార్మాట్లు: PDF (ఒక ఫైల్‌కు గరిష్టంగా 10MB)',
    'fileUpload.selectedFiles': 'ఎంచుకున్న ఫైల్స్',
    'fileUpload.remove': 'తొలగించు',
    
    // URL Input
    'urlInput.title': 'వెబ్‌సైట్ URLs',
    'urlInput.placeholder': 'వెబ్‌సైట్ URLs ఎంటర్ చేయండి (ఒక లైన్‌కు ఒకటి)\nhttps://example.com/csr\nhttps://company.com/sustainability',
    'urlInput.description': 'ఒక లైన్‌కు ఒక URL ఎంటర్ చేయండి. URLs లో http:// లేదా https:// ఉందని నిర్ధారించుకోండి',
    
    // Topic Input
    'topic.title': 'పరిశోధన అంశం',
    'topic.placeholder': 'ఉదా., పర్యావరణ స్థిరత్వం, కమ్యూనిటీ నిమగ్నత, నైతిక అభ్యాసాలు',
    'topic.quickSuggestions': 'శీఘ్ర సూచనలు:',
    'topic.description': 'మీ మూలాలనుండి మీరు పరిశోధన చేయాలని మరియు సమాచారాన్ని సేకరించాలని అనుకునే అంశాన్ని పేర్కొనండి',
    
    // Extract Button
    'extract.button': 'అన్ని మూలాలనుండి సేకరించండి',
    'extract.loading': 'కంటెంట్ సేకరిస్తున్నాం...',
    
    // Results
    'results.title': 'సేకరణ ఫలితాలు',
    'results.processing': 'మీ మూలాలను ప్రాసెస్ చేస్తున్నాం...',
    'results.processingDesc': 'AI తో కంటెంట్‌ను సేకరించి విశ్లేషిస్తున్నాం',
    'results.placeholder': 'సేకరణ తర్వాత ఫలితాలు ఇక్కడ కనిపిస్తాయి...\n\nAI మీ PDF మరియు వెబ్‌సైట్లను విశ్లేషించి మీ పేర్కొన్న అంశం గురించి సంబంధిత సమాచారాన్ని సేకరిస్తుంది.',
    'results.extractedImages': 'సేకరించిన చిత్రాలు',
    'results.copyToClipboard': 'క్లిప్‌బోర్డ్‌లో కాపీ చేయండి',
    'results.downloadText': 'టెక్స్ట్ ఫైల్‌గా డౌన్‌లోడ్ చేయండి',
    'results.downloadWord': 'Word ఫైల్‌గా డౌన్‌లోడ్ చేయండి',
    'results.downloadPDF': 'PDF గా డౌన్‌లోడ్ చేయండి',
    'results.shareEmail': 'ఇమెయిల్ ద్వారా షేర్ చేయండి',
    
    // Toast Messages
    'toast.copied': 'క్లిప్‌బోర్డ్‌లో కాపీ చేయబడింది',
    'toast.copiedDesc': 'ఫలితాలు మీ క్లిప్‌బోర్డ్‌లో కాపీ చేయబడ్డాయి',
    'toast.copyFailed': 'కాపీ విఫలమైంది',
    'toast.copyFailedDesc': 'క్లిప్‌బోర్డ్‌లో కాపీ చేయడంలో విఫలమైంది',
    'toast.downloadStarted': 'డౌన్‌లోడ్ ప్రారంభమైంది',
    'toast.downloadTextDesc': 'మీ ఫలితాలు టెక్స్ట్ ఫైల్‌గా డౌన్‌లోడ్ అవుతున్నాయి',
    'toast.downloadPDFDesc': 'మీ ఫలితాలు PDF ఫైల్‌గా డౌన్‌లోడ్ అవుతున్నాయి',
    'toast.downloadWordDesc': 'మీ ఫలితాలు Word ఫైల్‌గా డౌన్‌లోడ్ అవుతున్నాయి',
  },
  mr: {
    // Header
    'header.title': 'डेटा एक्स्ट्रॅक्टर',
    'header.subtitle': 'AI-चालित अंतर्दृष्टींसह PDF आणि वेबसाइट्समधून डेटा सामग्री काढा आणि विश्लेषण करा',
    'header.createdBy': 'तयार केले',
    
    // Source Selector
    'source.title': 'स्रोत प्रकार',
    'source.pdf': 'PDF फायली',
    'source.website': 'वेबसाइट्स',
    'source.both': 'दोन्ही स्रोत',
    'source.pdfDesc': 'PDF दस्तऐवजांमधून काढा',
    'source.websiteDesc': 'वेब पृष्ठांमधून काढा',
    'source.bothDesc': 'PDF आणि वेबसाइट्समधून काढा',
    
    // File Uploader
    'fileUpload.title': 'PDF फायली अपलोड करा',
    'fileUpload.dragDrop': 'PDF फायली येथे ड्रॅग आणि ड्रॉप करा, किंवा निवडण्यासाठी क्लिक करा',
    'fileUpload.supportedFormats': 'समर्थित स्वरूप: PDF (प्रति फाइल कमाल 10MB)',
    'fileUpload.selectedFiles': 'निवडलेल्या फायली',
    'fileUpload.remove': 'काढा',
    
    // URL Input
    'urlInput.title': 'वेबसाइट URLs',
    'urlInput.placeholder': 'वेबसाइट URLs प्रविष्ट करा (प्रति ओळ एक)\nhttps://example.com/csr\nhttps://company.com/sustainability',
    'urlInput.description': 'प्रति ओळ एक URL प्रविष्ट करा. URLs मध्ये http:// किंवा https:// असल्याची खात्री करा',
    
    // Topic Input
    'topic.title': 'संशोधन विषय',
    'topic.placeholder': 'उदा., पर्यावरणीय टिकाऊपणा, समुदायिक सहभाग, नैतिक प्रथा',
    'topic.quickSuggestions': 'द्रुत सूचना:',
    'topic.description': 'तुम्हाला तुमच्या स्रोतांमधून संशोधन आणि माहिती काढायचा असलेला विषय निर्दिष्ट करा',
    
    // Extract Button
    'extract.button': 'सर्व स्रोतांमधून काढा',
    'extract.loading': 'सामग्री काढत आहे...',
    
    // Results
    'results.title': 'एक्स्ट्रॅक्शन परिणाम',
    'results.processing': 'तुमचे स्रोत प्रक्रिया करत आहे...',
    'results.processingDesc': 'AI सह सामग्री काढत आणि विश्लेषण करत आहे',
    'results.placeholder': 'एक्स्ट्रॅक्शन नंतर परिणाम येथे दिसतील...\n\nAI तुमचे PDF आणि वेबसाइट्सचे विश्लेषण करून तुमच्या निर्दिष्ट विषयावर संबंधित माहिती काढेल.',
    'results.extractedImages': 'काढलेली प्रतिमा',
    'results.copyToClipboard': 'क्लिपबोर्डमध्ये कॉपी करा',
    'results.downloadText': 'टेक्स्ट फाइल म्हणून डाउनलोड करा',
    'results.downloadWord': 'Word फाइल म्हणून डाउनलोड करा',
    'results.downloadPDF': 'PDF म्हणून डाउनलोड करा',
    'results.shareEmail': 'ईमेलद्वारे शेअर करा',
    
    // Toast Messages
    'toast.copied': 'क्लिपबोर्डमध्ये कॉपी केले',
    'toast.copiedDesc': 'परिणाम तुमच्या क्लिपबोर्डमध्ये कॉपी केले गेले आहेत',
    'toast.copyFailed': 'कॉपी अयशस्वी',
    'toast.copyFailedDesc': 'क्लिपबोर्डमध्ये कॉपी करण्यात अयशस्वी',
    'toast.downloadStarted': 'डाउनलोड सुरू',
    'toast.downloadTextDesc': 'तुमचे परिणाम टेक्स्ट फाइल म्हणून डाउनलोड होत आहेत',
    'toast.downloadPDFDesc': 'तुमचे परिणाम PDF फाइल म्हणून डाउनलोड होत आहेत',
    'toast.downloadWordDesc': 'तुमचे परिणाम Word फाइल म्हणून डाउनलोड होत आहेत',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
  };

  // Load saved language on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const t = (key: string): string => {
    return translations[currentLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
