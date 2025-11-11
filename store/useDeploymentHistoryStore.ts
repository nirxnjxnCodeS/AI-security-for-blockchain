import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeploymentRecord {
  id: string;
  projectName: string;
  contractAddress: string;
  network: number;
  networkName: string;
  transactionHash?: string;
  deployedAt: number;
  abi: any;
  bytecode: string;
  hasSecurityReport: boolean;
}

interface DeploymentHistoryState {
  deployments: DeploymentRecord[];
  addDeployment: (deployment: Omit<DeploymentRecord, 'id'>) => void;
  getDeploymentsByProject: (projectName: string) => DeploymentRecord[];
  getAllDeployments: () => DeploymentRecord[];
  clearHistory: () => void;
}

export const useDeploymentHistoryStore = create<DeploymentHistoryState>()(
  persist(
    (set, get) => ({
      deployments: [],

      addDeployment: (deployment) => {
        const newDeployment: DeploymentRecord = {
          ...deployment,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        set((state) => ({
          deployments: [newDeployment, ...state.deployments],
        }));
      },

      getDeploymentsByProject: (projectName: string) => {
        return get().deployments.filter((d) => d.projectName === projectName);
      },

      getAllDeployments: () => {
        return get().deployments;
      },

      clearHistory: () => {
        set({ deployments: [] });
      },
    }),
    {
      name: 'web3-deployment-history',
    }
  )
);
