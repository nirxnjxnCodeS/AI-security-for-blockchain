import { NextRequest, NextResponse } from 'next/server';
import { analyzeContractWithOpenAI } from '@/utils/openai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { contractCode } = await request.json();

    if (!contractCode) {
      return NextResponse.json(
        { error: 'Contract code is required' },
        { status: 400 }
      );
    }

    const report = await analyzeContractWithOpenAI(contractCode);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze contract'
      },
      { status: 500 }
    );
  }
}
