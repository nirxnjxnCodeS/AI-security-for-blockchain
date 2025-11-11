import axios from 'axios';
import { SecurityReport, Issue } from '@/store/useProjectStore';

export async function analyzeContractWithOpenAI(
  contractCode: string
): Promise<SecurityReport> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/responses',
      {
        model: 'gpt-5-nano',
        input: `
    You are a smart contract security expert. Analyze the following Solidity contract and return a structured JSON analysis.
    
    Return output strictly in JSON format:
    {
      "summary": "Brief overview of the contract and its security posture",
      "criticalIssues": [
        {
          "title": "Issue title",
          "description": "Detailed description",
          "severity": "critical",
          "line": 10,
          "recommendation": "How to fix"
        }
      ],
      "warnings": [],
      "suggestions": [],
      "overallRisk": "low|medium|high|critical"
    }
    
    Focus on:
    - Reentrancy attacks
    - Integer overflow/underflow
    - Access control issues
    - Gas optimization
    - Logic errors
    - Best practices violations
    
    Contract code:
    ${contractCode}
        `,
        // removed 'temperature'
        max_output_tokens: 2000, // ✅ correct new parameter
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    

    // The new Responses API has a different output structure
    const content =
      response.data.output?.[0]?.content?.[0]?.text ||
      response.data.output_text ||
      '';

    let analysis: SecurityReport;

    try {
      const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content.trim();
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      analysis = {
        summary: content,
        criticalIssues: [],
        warnings: [],
        suggestions: [],
        overallRisk: 'medium',
      };
    }

    return analysis;
  } catch (error: any) {
    console.error('OpenAI Analysis Error:', error);
    throw new Error(
      error.response?.data?.error?.message ||
        'Failed to analyze contract with OpenAI'
    );
  }
}

export function calculateRiskScore(report: SecurityReport): number {
  const weights = {
    critical: 100,
    high: 50,
    medium: 25,
    low: 10,
  };

  let score = 0;

  report.criticalIssues?.forEach((issue) => {
    score += weights[issue.severity];
  });

  report.warnings?.forEach((issue) => {
    score += weights[issue.severity];
  });

  return score;
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'high':
      return 'text-orange-500';
    case 'critical':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}
