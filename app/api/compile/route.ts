import { NextRequest, NextResponse } from 'next/server';
import { compileSolidityContract } from '@/utils/solidity-compiler';

export async function POST(request: NextRequest) {
  try {
    const { contractCode, contractName } = await request.json();

    if (!contractCode) {
      return NextResponse.json(
        { error: 'Contract code is required' },
        { status: 400 }
      );
    }

    const result = await compileSolidityContract(contractCode, contractName);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.errors,
          warnings: result.warnings
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      abi: result.abi,
      bytecode: result.bytecode,
      warnings: result.warnings,
    });
  } catch (error: any) {
    console.error('Compilation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
