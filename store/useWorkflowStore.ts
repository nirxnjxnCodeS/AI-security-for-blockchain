import { create } from 'zustand';

export type WorkflowStep =
  | 'idle'
  | 'compiling'
  | 'generating-abi'
  | 'generating-bytecode'
  | 'analyzing'
  | 'review'
  | 'deploying'
  | 'completed'
  | 'error';

interface WorkflowState {
  currentStep: WorkflowStep;
  stepStatus: Record<WorkflowStep, 'pending' | 'in-progress' | 'completed' | 'error'>;
  error: string | null;
  setStep: (step: WorkflowStep) => void;
  setStepStatus: (step: WorkflowStep, status: 'pending' | 'in-progress' | 'completed' | 'error') => void;
  setError: (error: string | null) => void;
  resetWorkflow: () => void;
}

const initialStepStatus: Record<WorkflowStep, 'pending' | 'in-progress' | 'completed' | 'error'> = {
  idle: 'pending',
  compiling: 'pending',
  'generating-abi': 'pending',
  'generating-bytecode': 'pending',
  analyzing: 'pending',
  review: 'pending',
  deploying: 'pending',
  completed: 'pending',
  error: 'pending',
};

export const useWorkflowStore = create<WorkflowState>((set) => ({
  currentStep: 'idle',
  stepStatus: initialStepStatus,
  error: null,

  setStep: (step: WorkflowStep) => {
    set({ currentStep: step });
  },

  setStepStatus: (step: WorkflowStep, status: 'pending' | 'in-progress' | 'completed' | 'error') => {
    set((state) => ({
      stepStatus: {
        ...state.stepStatus,
        [step]: status,
      },
    }));
  },

  setError: (error: string | null) => {
    set({ error });
  },

  resetWorkflow: () => {
    set({
      currentStep: 'idle',
      stepStatus: initialStepStatus,
      error: null,
    });
  },
}));
