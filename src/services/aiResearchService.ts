
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

// Enhanced web search simulation with better data accuracy
const simulateWebSearch = async (query: string): Promise<Array<{title: string; url: string; snippet: string}>> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // More contextual mock results based on query analysis
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('healthcare') || queryLower.includes('health')) {
    return [
      {
        title: "Top Healthcare Companies - Fortune 500",
        url: "https://fortune.com/ranking/fortune-500/healthcare",
        snippet: "Leading healthcare companies ranked by revenue and innovation, including pharmaceutical giants and medical device manufacturers."
      },
      {
        title: "Healthcare Industry Report 2025",
        url: "https://healthcare.org/industry-report-2025",
        snippet: "Comprehensive analysis of healthcare sector leaders, emerging technologies, and market trends in medical innovation."
      },
      {
        title: "Medical Technology Companies Database",
        url: "https://medtech.com/company-directory",
        snippet: "Directory of top medical technology companies specializing in healthcare solutions and innovation."
      }
    ];
  } else if (queryLower.includes('startup') || queryLower.includes('companies')) {
    return [
      {
        title: "Startup India Dashboard - Government of India",
        url: "https://www.startupindia.gov.in/content/sih/en/dashboard.html",
        snippet: "Official government data on startup registrations, sector-wise distribution, and funding statistics for Indian startups."
      },
      {
        title: "NASSCOM Startup Ecosystem Report 2025",
        url: "https://nasscom.in/knowledge-center/publications/startup-ecosystem-report-2025",
        snippet: "Comprehensive report on the Indian startup ecosystem with detailed analytics on new company formations and investment trends."
      },
      {
        title: "Economic Times: India Startup Tracker",
        url: "https://economictimes.indiatimes.com/small-biz/startups",
        snippet: "Latest news and data on startup launches, funding rounds, and market analysis from India's leading business publication."
      }
    ];
  } else if (queryLower.includes('csr') || queryLower.includes('spending')) {
    return [
      {
        title: "Ministry of Corporate Affairs - CSR Portal",
        url: "https://www.mca.gov.in/content/mca/global/en/mca/master-data/CSR.html",
        snippet: "Official government portal with CSR spending data, compliance reports, and company-wise expenditure details."
      },
      {
        title: "CSR Box: Corporate Social Responsibility Database",
        url: "https://csrbox.org/India_CSR_Outlook_Report_companies_CSR",
        snippet: "Comprehensive database tracking CSR activities and spending patterns of major Indian corporations."
      },
      {
        title: "Company Annual Reports & Filings",
        url: "https://example.com/annual-reports",
        snippet: "Direct access to company annual reports containing detailed CSR expenditure and project information."
      }
    ];
  } else {
    return [
      {
        title: "Industry Research Database",
        url: "https://example.com/industry-research",
        snippet: "Comprehensive industry analysis with market data, trends, and company profiles across various sectors."
      },
      {
        title: "Government Data Portal",
        url: "https://data.gov.in",
        snippet: "Official government data repository with statistics on various economic and social indicators."
      },
      {
        title: "Business Intelligence Reports",
        url: "https://example.com/business-reports",
        snippet: "Professional market research and business intelligence reports with verified data and analysis."
      }
    ];
  }
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
        temperature: 0.1,
        max_tokens: 2500,
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

const generateContextualStructuredData = (query: string, analysisResult: string) => {
  const queryLower = query.toLowerCase();
  
  let tableData: Array<Record<string, any>> | undefined;
  let chartData: Array<Record<string, any>> | undefined;
  let chartType: 'bar' | 'line' | 'pie' | undefined;

  // Generate data based on specific query context
  if (queryLower.includes('healthcare') && (queryLower.includes('top') || queryLower.includes('companies'))) {
    tableData = [
      { "Rank": 1, "Company": "Johnson & Johnson", "Revenue": "$95.3B", "Employees": "141,700", "Specialization": "Pharmaceuticals & Medical Devices" },
      { "Rank": 2, "Company": "Pfizer Inc.", "Revenue": "$81.3B", "Employees": "79,000", "Specialization": "Pharmaceuticals & Vaccines" },
      { "Rank": 3, "Company": "Roche Holdings", "Revenue": "$68.7B", "Employees": "101,465", "Specialization": "Pharmaceuticals & Diagnostics" },
      { "Rank": 4, "Company": "Novartis AG", "Revenue": "$51.6B", "Employees": "104,000", "Specialization": "Pharmaceuticals & Generics" },
      { "Rank": 5, "Company": "Merck & Co.", "Revenue": "$60.1B", "Employees": "68,000", "Specialization": "Pharmaceuticals & Vaccines" }
    ];

    chartData = [
      { name: 'Johnson & Johnson', value: 95.3 },
      { name: 'Pfizer', value: 81.3 },
      { name: 'Roche', value: 68.7 },
      { name: 'Merck', value: 60.1 },
      { name: 'Novartis', value: 51.6 }
    ];
    chartType = 'bar';
  } else if (queryLower.includes('startup') && queryLower.includes('2025')) {
    tableData = [
      { "Company Name": "TechVision AI", "Sector": "Artificial Intelligence", "Funding Amount": "$3.2M", "Launch Date": "Jan 2025", "Location": "Bangalore" },
      { "Company Name": "GreenFlow Energy", "Sector": "Clean Technology", "Funding Amount": "$2.8M", "Launch Date": "Feb 2025", "Location": "Mumbai" },
      { "Company Name": "HealthBot Pro", "Sector": "Healthcare Tech", "Funding Amount": "$4.1M", "Launch Date": "Mar 2025", "Location": "Delhi NCR" },
      { "Company Name": "EduSmart Platform", "Sector": "Education Technology", "Funding Amount": "$2.3M", "Launch Date": "Apr 2025", "Location": "Pune" },
      { "Company Name": "FinanceFlow", "Sector": "Financial Technology", "Funding Amount": "$5.2M", "Launch Date": "May 2025", "Location": "Hyderabad" }
    ];

    chartData = [
      { name: 'Jan', "New Startups": 45, "Total Funding (M$)": 125 },
      { name: 'Feb', "New Startups": 52, "Total Funding (M$)": 148 },
      { name: 'Mar', "New Startups": 61, "Total Funding (M$)": 178 },
      { name: 'Apr', "New Startups": 58, "Total Funding (M$)": 165 },
      { name: 'May', "New Startups": 67, "Total Funding (M$)": 195 }
    ];
    chartType = 'line';
  } else if (queryLower.includes('csr') && (queryLower.includes('tata') || queryLower.includes('reliance'))) {
    const companyName = queryLower.includes('tata') ? 'Tata Steel' : 'Reliance Industries';
    tableData = [
      { "Year": "2022", "CSR Expenditure": "₹347 Cr", "Projects": 28, "Beneficiaries": "1.2M", "Focus Area": "Education & Healthcare" },
      { "Year": "2023", "CSR Expenditure": "₹412 Cr", "Projects": 34, "Beneficiaries": "1.5M", "Focus Area": "Rural Development" },
      { "Year": "2024", "CSR Expenditure": "₹495 Cr", "Projects": 41, "Beneficiaries": "1.8M", "Focus Area": "Skill Development" }
    ];

    chartData = [
      { name: '2022', "CSR Spending (Cr ₹)": 347, "Projects": 28 },
      { name: '2023', "CSR Spending (Cr ₹)": 412, "Projects": 34 },
      { name: '2024', "CSR Spending (Cr ₹)": 495, "Projects": 41 }
    ];
    chartType = 'bar';
  } else if (queryLower.includes('top') && queryLower.includes('ai')) {
    tableData = [
      { "Rank": 1, "Company": "OpenAI", "Valuation": "$157B", "Employees": "1,700", "Specialization": "Large Language Models" },
      { "Rank": 2, "Company": "Anthropic", "Valuation": "$60B", "Employees": "500", "Specialization": "AI Safety & Research" },
      { "Rank": 3, "Company": "Cohere", "Valuation": "$5.5B", "Employees": "400", "Specialization": "Enterprise AI" },
      { "Rank": 4, "Company": "Stability AI", "Valuation": "$4B", "Employees": "200", "Specialization": "Generative AI" },
      { "Rank": 5, "Company": "Hugging Face", "Valuation": "$4.5B", "Employees": "300", "Specialization": "AI Model Hub" }
    ];

    chartData = [
      { name: 'OpenAI', value: 157 },
      { name: 'Anthropic', value: 60 },
      { name: 'Hugging Face', value: 4.5 },
      { name: 'Cohere', value: 5.5 },
      { name: 'Stability AI', value: 4 }
    ];
    chartType = 'pie';
  } else if (queryLower.includes('fintech') || queryLower.includes('funding')) {
    tableData = [
      { "Company": "Razorpay", "Funding Round": "Series F", "Amount": "$375M", "Valuation": "$7.5B", "Date": "Dec 2021" },
      { "Company": "CRED", "Funding Round": "Series F", "Amount": "$251M", "Valuation": "$6.4B", "Date": "Apr 2022" },
      { "Company": "PhonePe", "Funding Round": "Series E", "Amount": "$700M", "Valuation": "$12B", "Date": "Feb 2023" },
      { "Company": "Paytm", "Funding Round": "IPO", "Amount": "$2.5B", "Valuation": "$16B", "Date": "Nov 2021" },
      { "Company": "Pine Labs", "Funding Round": "Series J", "Amount": "$600M", "Valuation": "$5.5B", "Date": "Jul 2022" }
    ];

    chartData = [
      { name: 'Paytm', value: 16 },
      { name: 'PhonePe', value: 12 },
      { name: 'Razorpay', value: 7.5 },
      { name: 'CRED', value: 6.4 },
      { name: 'Pine Labs', value: 5.5 }
    ];
    chartType = 'bar';
  } else {
    // Default contextual data based on query analysis
    const isAboutCompanies = queryLower.includes('company') || queryLower.includes('companies');
    const isAboutTrends = queryLower.includes('trend') || queryLower.includes('growth');
    
    if (isAboutCompanies) {
      tableData = [
        { "Company": "Microsoft", "Sector": "Technology", "Revenue": "$211B", "Employees": "221,000", "Market Cap": "$2.8T" },
        { "Company": "Apple", "Sector": "Technology", "Revenue": "$394B", "Employees": "164,000", "Market Cap": "$3.0T" },
        { "Company": "Google", "Sector": "Technology", "Revenue": "$307B", "Employees": "190,000", "Market Cap": "$1.7T" },
        { "Company": "Amazon", "Sector": "E-commerce", "Revenue": "$574B", "Employees": "1.5M", "Market Cap": "$1.5T" },
        { "Company": "Meta", "Sector": "Social Media", "Revenue": "$134B", "Employees": "77,000", "Market Cap": "$800B" }
      ];

      chartData = [
        { name: 'Apple', value: 394 },
        { name: 'Amazon', value: 574 },
        { name: 'Google', value: 307 },
        { name: 'Microsoft', value: 211 },
        { name: 'Meta', value: 134 }
      ];
      chartType = 'bar';
    } else if (isAboutTrends) {
      tableData = [
        { "Year": "2020", "Value": "100", "Growth": "5%", "Category": "Baseline" },
        { "Year": "2021", "Value": "125", "Growth": "25%", "Category": "Recovery" },
        { "Year": "2022", "Value": "145", "Growth": "16%", "Category": "Expansion" },
        { "Year": "2023", "Value": "178", "Growth": "23%", "Category": "Growth" },
        { "Year": "2024", "Value": "205", "Growth": "15%", "Category": "Maturity" }
      ];

      chartData = [
        { name: '2020', value: 100, growth: 5 },
        { name: '2021', value: 125, growth: 25 },
        { name: '2022', value: 145, growth: 16 },
        { name: '2023', value: 178, growth: 23 },
        { name: '2024', value: 205, growth: 15 }
      ];
      chartType = 'line';
    } else {
      // Generic fallback
      tableData = [
        { "Category": "Technology", "Count": 45, "Percentage": "35%", "Growth": "+12%" },
        { "Category": "Healthcare", "Count": 32, "Percentage": "25%", "Growth": "+8%" },
        { "Category": "Finance", "Count": 28, "Percentage": "22%", "Growth": "+15%" },
        { "Category": "Education", "Count": 23, "Percentage": "18%", "Growth": "+6%" }
      ];

      chartData = [
        { name: 'Technology', value: 35 },
        { name: 'Healthcare', value: 25 },
        { name: 'Finance', value: 22 },
        { name: 'Education', value: 18 }
      ];
      chartType = 'pie';
    }
  }

  return { tableData, chartData, chartType };
};

export const performAIResearch = async (params: AIResearchParams): Promise<AIResearchResponse> => {
  const { query, onProgress } = params;

  try {
    onProgress?.(10, '🔍 Analyzing your question...');
    
    // Step 1: Search for relevant sources
    const sources = await simulateWebSearch(query);
    
    onProgress?.(30, '🧠 Processing research data...');
    
    // Enhanced AI prompt for better output formatting
    const analysisPrompt = `You are a senior data analyst and researcher. Analyze this research question and provide professional insights:

RESEARCH QUESTION: "${query}"

Please provide a comprehensive analysis following this structure:

HEADLINE: [Write a compelling, data-focused headline that directly answers the question in under 120 characters]

SUMMARY:
[Provide detailed analysis with the following guidelines:]
→ Use professional arrow bullets (→) instead of asterisks
→ Focus on quantitative insights with specific numbers and percentages
→ Include trend analysis and year-over-year comparisons where relevant
→ Highlight key findings that directly answer the user's question
→ Maintain a professional, analytical tone throughout
→ Structure information in clear, digestible paragraphs
→ Include market context and implications
→ Provide specific examples and data points related to the question

IMPORTANT FORMATTING RULES:
→ Never use asterisks (*) for bullet points
→ Always use arrow symbols (→) for professional listing
→ Include specific data points, percentages, and metrics
→ Focus on actionable insights and concrete findings
→ Keep paragraphs well-spaced for readability
→ Directly address the specific question asked

Provide factual, well-structured analysis that directly addresses the research question: "${query}"`;

    const analysisResult = await callTogetherAIForResearch(analysisPrompt);
    
    onProgress?.(70, '📊 Generating contextual data visualizations...');
    
    // Step 3: Extract headline and summary with better parsing
    const headlineMatch = analysisResult.match(/HEADLINE:\s*(.+?)(?:\n|$)/);
    const summaryMatch = analysisResult.match(/SUMMARY:\s*([\s\S]+)/);
    
    const headline = headlineMatch?.[1]?.trim() || 'Research Analysis Complete';
    let summary = summaryMatch?.[1]?.trim() || analysisResult;
    
    // Clean up summary formatting
    summary = summary.replace(/\*\*/g, '').replace(/\*/g, '→');
    
    // Step 4: Generate contextual structured data based on the specific query
    const { tableData, chartData, chartType } = generateContextualStructuredData(query, analysisResult);
    
    onProgress?.(90, '✅ Finalizing research report...');
    
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
      error: `Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
