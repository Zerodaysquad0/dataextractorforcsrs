
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadAsWord } from "@/utils/downloadWord";
import { useState } from "react";

const featureSummary = `
**Executive Summary**
- Comprehensive data extraction platform supporting web URLs and PDF uploads.
- Designed for business, research, and workflow automation.

**Multi-Source Data Extraction**
- Extract text and images from Websites and PDF documents.
- Supports simultaneous extraction from multiple sources.

**Advanced Email Sharing System**
- Send extracted data (including images/attachments) via email directly from the app.

**Multi-Language Support**
- UI available in English, Hindi, Tamil, Telugu, and Marathi, switchable at runtime.

**Multiple Export Formats**
- Download results in .txt, .pdf, and .docx (Word) formats.
- Word download includes advanced formatting: headings, bullets, hyperlinks, and image URL validation.

**UI/UX Features**
- Fully responsive design with mobile and desktop support.
- Animated transitions for interface elements.
- Visual feedback for actions and processing.

**Technical Infrastructure**
- Built using React, TypeScript, Tailwind CSS, shadcn/ui.
- Uses @tanstack/react-query for efficient data fetching.
- Lucide-react icon set for a modern appearance.
- Supabase integration for backend extensibility.

**Business Value**
- Speeds up research and document analysis.
- Ensures secure and professional sharing of information.

**Security & Compliance**
- File access managed securely.
- Email functionality runs on serverless backend (Supabase Edge Functions).

**Deployment**
- Ready for production and custom domain deployment via Lovable.
`;

export const FeatureReportButton = () => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await downloadAsWord(
      featureSummary.trim(),
      "feature-summary-management.docx",
      "Feature Summary & Business Value Report",
      "",
      []
    );
    setGenerating(false);
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={generating}
      variant="outline"
      size="sm"
      className="ml-2 bg-white/90 hover:bg-blue-50 border-blue-200"
      title="Download Feature Summary for Management"
      data-testid="feature-report-download"
    >
      <Download className="w-4 h-4 mr-2" />
      {generating ? "Generating..." : "Feature Summary"}
    </Button>
  );
};
