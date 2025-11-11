export function getConstructorInputs(abi: any[]): any[] {
  console.log('🔍 getConstructorInputs called with ABI:', abi);

  // Safety check: ensure abi is an array
  if (!abi || !Array.isArray(abi)) {
    console.error('❌ ABI is not an array:', typeof abi, abi);
    return [];
  }

  console.log('🔍 Searching for constructor in ABI items...');
  console.log('🔍 ABI items:', abi.map(item => ({ type: item.type, name: item.name })));

  const constructor = abi.find((item) => item.type === 'constructor');

  if (constructor) {
    console.log('✅ Constructor found:', constructor);
    console.log('✅ Constructor inputs:', constructor.inputs);
  } else {
    console.log('⚠️ No constructor found in ABI');
  }

  return constructor?.inputs || [];
}

export function hasConstructor(abi: any[]): boolean {
  return abi.some((item) => item.type === 'constructor');
}

export function parseConstructorArgs(inputs: any[], values: string[]): any[] {
  return inputs.map((input, index) => {
    const value = values[index];
    const type = input.type;

    if (!value) return undefined;

    // Handle array types
    if (type.includes('[') && type.includes(']')) {
      try {
        const parsedArray = JSON.parse(value);

        // Parse each element based on base type
        const baseType = type.substring(0, type.indexOf('['));

        return parsedArray.map((item: any) => {
          if (baseType.startsWith('uint') || baseType.startsWith('int')) {
            return BigInt(item);
          } else if (baseType === 'bool') {
            return typeof item === 'boolean' ? item : item.toLowerCase() === 'true';
          } else if (baseType === 'address' || baseType === 'string' || baseType.startsWith('bytes')) {
            return item;
          }
          return item;
        });
      } catch (error) {
        console.error('Error parsing array:', error);
        return value;
      }
    }

    // Handle uint types (uint8, uint16, uint256, etc.)
    if (type.startsWith('uint')) {
      try {
        return BigInt(value);
      } catch (error) {
        console.error('Error parsing uint:', error);
        return value;
      }
    }

    // Handle int types (int8, int16, int256, etc.)
    if (type.startsWith('int')) {
      try {
        return BigInt(value);
      } catch (error) {
        console.error('Error parsing int:', error);
        return value;
      }
    }

    // Handle boolean
    if (type === 'bool') {
      return value.toLowerCase() === 'true';
    }

    // Handle address - return as-is (should be validated in modal)
    if (type === 'address') {
      return value;
    }

    // Handle string
    if (type === 'string') {
      return value;
    }

    // Handle bytes types (bytes, bytes32, etc.)
    if (type === 'bytes' || type.startsWith('bytes')) {
      return value;
    }

    // Handle tuple/struct types
    if (type === 'tuple') {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error('Error parsing tuple:', error);
        return value;
      }
    }

    // Default: return value as-is
    return value;
  });
}

/**
 * Get a human-readable description of a Solidity type
 */
export function getTypeDescription(type: string): string {
  if (type === 'address') return 'Ethereum address';
  if (type === 'string') return 'Text string';
  if (type === 'bool') return 'Boolean (true/false)';
  if (type.startsWith('uint')) return 'Unsigned integer';
  if (type.startsWith('int')) return 'Signed integer';
  if (type.startsWith('bytes')) return 'Byte array';
  if (type.includes('[]')) return 'Array';
  if (type === 'tuple') return 'Struct/Tuple';
  return type;
}

/**
 * Validate a value against its expected Solidity type
 */
export function validateValue(type: string, value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Value is required' };
  }

  // Address validation
  if (type === 'address') {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      return { valid: false, error: 'Invalid Ethereum address format' };
    }
    return { valid: true };
  }

  // Uint validation (unsigned integers)
  if (type.startsWith('uint')) {
    if (!/^\d+$/.test(value)) {
      return { valid: false, error: 'Must be a positive number (no decimals)' };
    }
    if (value.startsWith('-')) {
      return { valid: false, error: 'Unsigned integers cannot be negative' };
    }
    try {
      BigInt(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Number is too large' };
    }
  }

  // Int validation (signed integers)
  if (type.startsWith('int') && !type.startsWith('internal')) {
    if (!/^-?\d+$/.test(value)) {
      return { valid: false, error: 'Must be a valid integer (no decimals)' };
    }
    try {
      BigInt(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Number is too large' };
    }
  }

  // Bool validation
  if (type === 'bool') {
    if (!['true', 'false'].includes(value.toLowerCase())) {
      return { valid: false, error: 'Must be "true" or "false"' };
    }
    return { valid: true };
  }

  // Bytes validation
  if (type.startsWith('bytes') && type !== 'bytes') {
    if (!/^0x[a-fA-F0-9]*$/.test(value)) {
      return { valid: false, error: 'Must be a valid hex string (0x...)' };
    }
    const size = parseInt(type.replace('bytes', ''));
    const byteLength = (value.length - 2) / 2;
    if (byteLength !== size) {
      return { valid: false, error: `Must be exactly ${size} bytes` };
    }
    return { valid: true };
  }

  // Array validation
  if (type.includes('[') && type.includes(']')) {
    try {
      JSON.parse(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Must be a valid JSON array' };
    }
  }

  // Default: assume valid
  return { valid: true };
}
