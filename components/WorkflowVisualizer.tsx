'use client';

import { useWorkflowStore } from '@/store/useWorkflowStore';
import { motion } from 'framer-motion';
import {
  Code,
  FileJson,
  Binary,
  Shield,
  FileCheck,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const workflowSteps = [
  { id: 'compiling', label: 'Compile Contract', icon: Code },
  { id: 'generating-abi', label: 'Generate ABI', icon: FileJson },
  { id: 'generating-bytecode', label: 'Generate Bytecode', icon: Binary },
  { id: 'analyzing', label: 'AI Analysis', icon: Shield },
  { id: 'review', label: 'Review Report', icon: FileCheck },
  { id: 'deploying', label: 'Deploy Contract', icon: Rocket },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export default function WorkflowVisualizer() {
  const { currentStep, stepStatus } = useWorkflowStore();

  const getStepIcon = (stepId: string, Icon: any) => {
    const status = stepStatus[stepId as keyof typeof stepStatus];

    if (status === 'in-progress') {
      return <Loader2 className="animate-spin" size={24} />;
    }

    if (status === 'completed') {
      return <CheckCircle2 size={24} className="text-success" />;
    }

    if (status === 'error') {
      return <AlertCircle size={24} className="text-error" />;
    }

    return <Icon size={24} />;
  };

  const getStepColor = (stepId: string) => {
    const status = stepStatus[stepId as keyof typeof stepStatus];

    if (status === 'in-progress') return 'border-primary bg-primary/10';
    if (status === 'completed') return 'border-success bg-success/10';
    if (status === 'error') return 'border-error bg-error/10';
    return 'border-dark-border bg-dark-card';
  };

  const getStepTextColor = (stepId: string) => {
    const status = stepStatus[stepId as keyof typeof stepStatus];

    if (status === 'in-progress') return 'text-primary';
    if (status === 'completed') return 'text-success';
    if (status === 'error') return 'text-error';
    return 'text-gray-400';
  };

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Deployment Workflow</h3>

      <div className="space-y-4">
        {workflowSteps.map((step, index) => (
          <div key={step.id}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${getStepColor(step.id)}`}
            >
              <div className={getStepTextColor(step.id)}>
                {getStepIcon(step.id, step.icon)}
              </div>

              <div className="flex-1">
                <h4 className={`font-semibold ${getStepTextColor(step.id)}`}>
                  {step.label}
                </h4>
                <p className="text-sm text-gray-500 capitalize">
                  {stepStatus[step.id as keyof typeof stepStatus]}
                </p>
              </div>

              {stepStatus[step.id as keyof typeof stepStatus] === 'in-progress' && (
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>

            {index < workflowSteps.length - 1 && (
              <div className="flex justify-center py-2">
                <div
                  className={`w-0.5 h-6 ${
                    stepStatus[step.id as keyof typeof stepStatus] === 'completed'
                      ? 'bg-success'
                      : 'bg-dark-border'
                  } transition-colors duration-300`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
