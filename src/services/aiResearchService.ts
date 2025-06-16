
import { TOGETHER_API_CONFIG } from '@/config/api';
import type { ResearchResult } from '@/components/AIResearch';

export interface AIResearchParams {
  query: string;
  onProgress?: (progress: number, status: string) => void;
}

export interface AIResearchResponse {
  success: boolean;
  data?: ResearchResult;
  error?: string;
}

// Simulated web search function (in production, this would use a real search API)
const simulateWebSearch = async (query: string): Promise<Array<{title: string; url: string; snippet: string}>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock search results based on query content
  const mockResults = [
    {
      title: "Industry Report: Startup Ecosystem Analysis 2025",
      url: "https://example.com/startup-report-2025",
      snippet: "Comprehensive analysis of startup landscape with detailed statistics and trends for the current year."
    },
    {
      title: "Government Database: New Business Registrations",
      url: "https://example.com/govt-business-data",
      snippet: "Official government portal tracking new business registrations and startup formations across regions."
    },
    {
      title: "Business News: Latest Startup Funding Rounds",
      url: "https://example.com/funding-news",
      snippet: "Recent news coverage of startup funding activities and new company launches in various sectors."
    }
  ];

  return mockResults;
};

const callTogetherAIForResearch = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(TOGETHER_API_CONFIG.BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TOGETHER_API_CONFIG.MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Together.ai API Error:', error);
    throw error;
  }
};

const generateStructuredData = (query: string, analysisResult: string) => {
  // Generate mock structured data based on query type
  const queryLower = query.toLowerCase();
  
  let tableData: Array<Record<string, any>> | undefined;
  let chartData: Array<Record<string, any>> | undefined;
  let chartType: 'bar' | 'line' | 'pie' | undefined;

  if (queryLower.includes('startup') || queryLower.includes('companies')) {
    tableData = [
      { Company: 'TechStart AI', Sector: 'Artificial Intelligence', Funding: '$2.5M', Founded: '2025' },
      { Company: 'GreenTech Solutions', Sector: 'Clean Energy', Funding: '$1.8M', Founded: '2025' },
      { Company: 'HealthBot', Sector: 'Healthcare', Funding: '$3.2M', Founded: '2025' },
      { Company: 'EduPlatform', Sector: 'Education', Funding: '$1.5M', Founded: '2025' },
      { Company: 'FinanceFlow', Sector: 'Fintech', Funding: '$4.1M', Founded: '2025' }
    ];

    chartData = [
      { name: 'AI/Tech', value: 35 },
      { name: 'Healthcare', value: 25 },
      { name: 'Fintech', value: 20 },
      { name: 'Clean Energy', value: 12 },
      { name: 'Education', value: 8 }
    ];
    chartType = 'pie';
  } else if (queryLower.includes('spending') || queryLower.includes('csr') || queryLower.includes('trend')) {
    tableData = [
      { Year: '2022', Amount: '₹245 Cr', Projects: 12, Beneficiaries: '45,000' },
      { Year: '2023', Amount: '₹320 Cr', Projects: 18, Beneficiaries: '62,000' },
      { Year: '2024', Amount: '₹410 Cr', Projects: 24, Beneficiaries: '78,000' },
    ];

    chartData = [
      { name: '2022', 'CSR Spending (Cr)': 245, Projects: 12 },
      { name: '2023', 'CSR Spending (Cr)': 320, Projects: 18 },
      { name: '2024', 'CSR Spending (Cr)': 410, Projects: 24 },
    ];
    chartType = 'bar';
  } else if (queryLower.includes('top') || queryLower.includes('ranking')) {
    tableData = [
      { Rank: 1, Company: 'EduTech Global', Market_Cap: '$2.1B', Employees: '8,500' },
      { Rank: 2, Company: 'SmartLearn AI', Market_Cap: '$1.8B', Employees: '6,200' },
      { Rank: 3, Company: 'ClassroomBot', Market_Cap: '$1.5B', Employees: '4,800' },
      { Rank: 4, Company: 'TeachAssist Pro', Market_Cap: '$1.2B', Employees: '3,600' },
      { Rank: 5, Company: 'EduAnalytics', Market_Cap: '$950M', Employees: '2,900' }
    ];

    chartData = [
      { name: 'EduTech Global', value: 2100 },
      { name: 'SmartLearn AI', value: 1800 },
      { name: 'ClassroomBot', value: 1500 },
      { name: 'TeachAssist Pro', value: 1200 },
      { name: 'EduAnalytics', value: 950 }
    ];
    chartType = 'bar';
  }

  return { tableData, chartData, chartType };
};

export const performAIResearch = async (params: AIResearchParams): Promise<AIResearchResponse> => {
  const { query, onProgress } = params;

  try {
    onProgress?.(10, '🔍 Searching web sources...');
    
    // Step 1: Search for relevant sources
    const sources = await simulateWebSearch(query);
    
    onProgress?.(30, '🧠 Analyzing search results...');
    
    // Step 2: Analyze the query and generate insights
    const analysisPrompt = `You are a professional research analyst. Analyze this question and provide structured insights:

QUESTION: "${query}"

Based on this research question, provide:

1. A compelling headline (max 120 characters)
2. A comprehensive summary with key findings and insights
3. Professional analysis with data points where relevant

IMPORTANT GUIDELINES:
→ Use professional bullet points with "→" instead of asterisks
→ Focus on actionable insights and concrete data
→ Maintain a professional, analytical tone
→ Include specific numbers, percentages, or metrics when possible
→ Structure information clearly with proper spacing
→ Avoid speculation - focus on factual analysis

Format your response as:
HEADLINE: [Your compelling headline here]

SUMMARY:
[Your detailed analytical summary here with bullet points using → symbol]

Keep the response informative, well-structured, and citation-ready.`;

    const analysisResult = await callTogetherAIForResearch(analysisPrompt);
    
    onProgress?.(70, '📊 Generating structured data...');
    
    // Step 3: Extract headline and summary
    const headlineMatch = analysisResult.match(/HEADLINE:\s*(.+?)(?:\n|$)/);
    const summaryMatch = analysisResult.match(/SUMMARY:\s*([\s\S]+)/);
    
    const headline = headlineMatch?.[1]?.trim() || 'Research Analysis Complete';
    const summary = summaryMatch?.[1]?.trim() || analysisResult;

    // Step 4: Generate structured data
    const { tableData, chartData, chartType } = generateStructuredData(query, analysisResult);
    
    onProgress?.(90, '✅ Finalizing research results...');
    
    const result: ResearchResult = {
      query,
      headline,
      summary,
      tableData,
      chartData,
      chartType,
      sources,
      timestamp: new Date().toISOString()
    };

    onProgress?.(100, '🎯 Research complete!');
    
    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('AI Research Error:', error);
    return {
      success: false,
      error: `Research failed: ${error}`
    };
  }
};
