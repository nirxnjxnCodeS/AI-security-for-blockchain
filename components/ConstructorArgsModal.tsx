'use client';

import { useState, useMemo } from 'react';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConstructorArgsModalProps {
  inputs: any[];
  onConfirm: (args: string[]) => void;
  onCancel: () => void;
}

interface ValidationError {
  index: number;
  message: string;
}

export default function ConstructorArgsModal({ inputs, onConfirm, onCancel }: ConstructorArgsModalProps) {
  const [args, setArgs] = useState<string[]>(inputs.map(() => ''));
  const [touched, setTouched] = useState<boolean[]>(inputs.map(() => false));

  // Validate individual input
  const validateInput = (type: string, value: string): string | null => {
    if (!value.trim()) return 'This field is required';

    // Address validation
    if (type === 'address') {
      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        return 'Invalid address format. Must be a valid Ethereum address (0x...)';
      }
    }

    // Uint validation (unsigned integers - must be positive)
    if (type.startsWith('uint')) {
      if (!/^\d+$/.test(value)) {
        return 'Must be a positive number (no decimals)';
      }
      if (value.startsWith('-')) {
        return 'Unsigned integers must be positive';
      }
      try {
        BigInt(value);
      } catch {
        return 'Number is too large or invalid';
      }
    }

    // Int validation (signed integers - can be negative)
    if (type.startsWith('int') && !type.startsWith('internal')) {
      if (!/^-?\d+$/.test(value)) {
        return 'Must be a valid integer (no decimals)';
      }
      try {
        BigInt(value);
      } catch {
        return 'Number is too large or invalid';
      }
    }

    // Bool validation
    if (type === 'bool') {
      if (!['true', 'false'].includes(value.toLowerCase())) {
        return 'Must be either "true" or "false"';
      }
    }

    // Bytes validation
    if (type.startsWith('bytes') && type !== 'bytes') {
      const size = parseInt(type.replace('bytes', ''));
      if (!/^0x[a-fA-F0-9]*$/.test(value)) {
        return 'Must be a valid hex string starting with 0x';
      }
      const byteLength = (value.length - 2) / 2;
      if (byteLength !== size) {
        return `Must be exactly ${size} bytes (${size * 2} hex characters after 0x)`;
      }
    }

    // Array validation
    if (type.includes('[') && type.includes(']')) {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return 'Must be a valid array';
        }
      } catch {
        return 'Must be a valid JSON array (e.g., ["item1", "item2"] or [1, 2, 3])';
      }
    }

    return null;
  };

  // Validate all inputs
  const errors = useMemo(() => {
    const newErrors: ValidationError[] = [];
    inputs.forEach((input, index) => {
      if (touched[index]) {
        const error = validateInput(input.type, args[index]);
        if (error) {
          newErrors.push({ index, message: error });
        }
      }
    });
    return newErrors;
  }, [args, inputs, touched]);

  const handleInputChange = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const handleBlur = (index: number) => {
    const newTouched = [...touched];
    newTouched[index] = true;
    setTouched(newTouched);
  };

  const handleSubmit = () => {
    // Mark all as touched
    setTouched(inputs.map(() => true));

    // Validate all inputs
    const allErrors: ValidationError[] = [];
    inputs.forEach((input, index) => {
      const error = validateInput(input.type, args[index]);
      if (error) {
        allErrors.push({ index, message: error });
      }
    });

    if (allErrors.length > 0) {
      // Don't submit if there are errors
      return;
    }

    onConfirm(args);
  };

  // Get placeholder text based on type
  const getPlaceholder = (type: string): string => {
    if (type === 'address') return '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    if (type === 'string') return 'Enter text (e.g., "My Token")';
    if (type === 'uint8') return '18';
    if (type === 'uint256' || type.startsWith('uint')) return '1000000';
    if (type.startsWith('int')) return '-1000 or 1000';
    if (type === 'bool') return 'true or false';
    if (type.startsWith('bytes')) return '0x1234...';
    if (type.includes('[')) return '["item1", "item2"]';
    return `Enter ${type} value`;
  };

  // Get help text based on type
  const getHelpText = (type: string): string => {
    if (type === 'address') return 'A valid Ethereum address (42 characters starting with 0x)';
    if (type === 'string') return 'Any text value (without quotes)';
    if (type === 'uint8') return 'Unsigned 8-bit integer (0 to 255, commonly used for decimals)';
    if (type === 'uint256') return 'Unsigned 256-bit integer (positive numbers only, no decimals)';
    if (type.startsWith('uint')) return 'Unsigned integer (positive numbers only, no decimals)';
    if (type.startsWith('int')) return 'Signed integer (positive or negative whole numbers)';
    if (type === 'bool') return 'Boolean value: true or false';
    if (type.startsWith('bytes')) {
      const size = type.replace('bytes', '');
      return size ? `Fixed-size byte array (${size} bytes in hex format starting with 0x)` : 'Dynamic byte array in hex format starting with 0x';
    }
    if (type.includes('[')) {
      const baseType = type.substring(0, type.indexOf('['));
      return `Array of ${baseType} values in JSON format (e.g., [value1, value2])`;
    }
    return `Enter a valid ${type} value`;
  };

  // Render input field based on type
  const renderInputField = (input: any, index: number) => {
    const error = errors.find(e => e.index === index);
    const hasError = touched[index] && error;
    const isValid = touched[index] && !error && args[index].trim();

    // Boolean type - use select dropdown
    if (input.type === 'bool') {
      return (
        <select
          value={args[index]}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onBlur={() => handleBlur(index)}
          className={`w-full px-4 py-2 bg-dark-bg border rounded-lg text-white focus:outline-none transition-colors ${
            hasError ? 'border-red-500 focus:border-red-500' :
            isValid ? 'border-green-500 focus:border-green-500' :
            'border-dark-border focus:border-primary'
          }`}
        >
          <option value="">Select value</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    // Array type - use textarea
    if (input.type.includes('[') && input.type.includes(']')) {
      return (
        <textarea
          value={args[index]}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onBlur={() => handleBlur(index)}
          placeholder={getPlaceholder(input.type)}
          rows={3}
          className={`w-full px-4 py-2 bg-dark-bg border rounded-lg text-white focus:outline-none transition-colors resize-none font-mono text-sm ${
            hasError ? 'border-red-500 focus:border-red-500' :
            isValid ? 'border-green-500 focus:border-green-500' :
            'border-dark-border focus:border-primary'
          }`}
        />
      );
    }

    // Default input field
    return (
      <div className="relative">
        <input
          type="text"
          value={args[index]}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onBlur={() => handleBlur(index)}
          placeholder={getPlaceholder(input.type)}
          className={`w-full px-4 py-2 pr-10 bg-dark-bg border rounded-lg text-white focus:outline-none transition-colors ${
            hasError ? 'border-red-500 focus:border-red-500' :
            isValid ? 'border-green-500 focus:border-green-500' :
            'border-dark-border focus:border-primary'
          }`}
        />
        {isValid && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={18} />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-card rounded-lg border border-dark-border p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Constructor Arguments</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">This contract requires constructor arguments</p>
            <p className="text-blue-400">Please provide the values below. All fields are required for deployment.</p>
          </div>
        </div>

        <div className="space-y-5">
          {inputs.map((input, index) => {
            const error = errors.find(e => e.index === index);
            const hasError = touched[index] && error;

            return (
              <div key={index}>
                <label className="block mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {input.name || `Argument ${index + 1}`}
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                      {input.type}
                    </span>
                  </div>
                </label>

                {renderInputField(input, index)}

                {hasError ? (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1.5">
                    {getHelpText(input.type)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-dark-border">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-dark-hover hover:bg-dark-border text-white rounded-lg transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={args.some((arg) => !arg.trim())}
            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Deploy Contract
          </button>
        </div>
      </motion.div>
    </div>
  );
}
