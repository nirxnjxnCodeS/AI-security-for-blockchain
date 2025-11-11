import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  description: string;
  contractCode: string;
  abi?: any;
  bytecode?: string;
  securityReport?: SecurityReport;
  deployedAddress?: string;
  deployedNetwork?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SecurityReport {
  summary: string;
  criticalIssues: Issue[];
  warnings: Issue[];
  suggestions: Issue[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
}

export interface Issue {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  line?: number;
  recommendation: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  createProject: (name: string, description: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,

      createProject: (name: string, description: string) => {
        const newProject: Project = {
          id: Date.now().toString(),
          name,
          description,
          contractCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    // Your smart contract code here
}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }));
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => {
          const updatedProjects = state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          );

          const updatedCurrentProject =
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
              : state.currentProject;

          console.log('Updating project:', id);
          console.log('Updates:', updates);
          console.log('Updated currentProject:', updatedCurrentProject);

          return {
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
          };
        });
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      setCurrentProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          set({ currentProject: project });
        }
      },

      clearCurrentProject: () => {
        set({ currentProject: null });
      },
    }),
    {
      name: 'web3-workflow-projects',
    }
  )
);
