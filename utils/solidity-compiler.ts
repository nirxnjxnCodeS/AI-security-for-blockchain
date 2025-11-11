export interface CompilationResult {
  success: boolean;
  abi?: any;
  bytecode?: string;
  errors?: string[];
  warnings?: string[];
}

let solcInstance: any = null;

async function getSolc() {
  if (solcInstance) return solcInstance;

  // Dynamically import solc to avoid WebAssembly issues
  const solc = await import('solc');
  solcInstance = solc.default || solc;
  return solcInstance;
}

function findImports(path: string) {
  try {
    if (path.startsWith('@openzeppelin/')) {
      const fs = require('fs');
      const nodePath = require('path');
      const contractPath = nodePath.join(
        process.cwd(),
        'node_modules',
        path
      );

      if (fs.existsSync(contractPath)) {
        const contents = fs.readFileSync(contractPath, 'utf8');
        return { contents };
      }
    }
    return { error: 'File not found' };
  } catch (error) {
    return { error: 'File not found' };
  }
}

export async function compileSolidityContract(
  sourceCode: string,
  contractName?: string
): Promise<CompilationResult> {
  try {
    // Get solc instance asynchronously
    const solc = await getSolc();

    // Prepare the input for the Solidity compiler
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: sourceCode,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode'],
          },
        },
        optimizer: {
          enabled: process.env.NEXT_PUBLIC_OPTIMIZER_ENABLED === 'true',
          runs: parseInt(process.env.NEXT_PUBLIC_OPTIMIZER_RUNS || '200'),
        },
      },
    };

    // Compile the contract with import callback
    const output = JSON.parse(
      solc.compile(JSON.stringify(input), { import: findImports })
    );

    // Check for errors
    if (output.errors) {
      const errors = output.errors.filter((error: any) => error.severity === 'error');
      const warnings = output.errors.filter((error: any) => error.severity === 'warning');

      if (errors.length > 0) {
        return {
          success: false,
          errors: errors.map((e: any) => e.formattedMessage),
          warnings: warnings.map((w: any) => w.formattedMessage),
        };
      }
    }

    // Extract the compiled contract
    const contracts = output.contracts['contract.sol'];

    if (!contracts || Object.keys(contracts).length === 0) {
      return {
        success: false,
        errors: ['No contract found in the source code'],
      };
    }

    // Get the first contract or the specified contract name
    const contractKey = contractName || Object.keys(contracts)[0];
    const contract = contracts[contractKey];

    if (!contract) {
      return {
        success: false,
        errors: [`Contract "${contractName}" not found`],
      };
    }

    return {
      success: true,
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
      warnings: output.errors
        ? output.errors
            .filter((e: any) => e.severity === 'warning')
            .map((w: any) => w.formattedMessage)
        : [],
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || 'Compilation failed'],
    };
  }
}

export function extractContractName(sourceCode: string): string | null {
  const contractRegex = /contract\s+(\w+)/;
  const match = sourceCode.match(contractRegex);
  return match ? match[1] : null;
}
