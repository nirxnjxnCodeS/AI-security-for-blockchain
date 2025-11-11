'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { FolderOpen, Plus, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProjectList() {
  const { projects, currentProject, createProject, deleteProject, setCurrentProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    createProject(projectName, projectDescription);
    setProjectName('');
    setProjectDescription('');
    setShowCreateModal(false);
    toast.success('Project created successfully');
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      toast.success('Project deleted');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setCurrentProject(project.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                currentProject?.id === project.id
                  ? 'border-primary bg-primary/10'
                  : 'border-dark-border bg-dark-bg hover:border-dark-hover'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{project.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                  {project.deployedAddress && (
                    <div className="mt-2 px-2 py-1 bg-success/10 border border-success rounded text-xs text-success inline-block">
                      Deployed
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  className="p-2 hover:bg-red-500/10 rounded transition-colors text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-card rounded-lg border border-dark-border p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Create New Project</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Smart Contract"
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description (Optional)</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="A brief description of your smart contract"
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setProjectName('');
                  setProjectDescription('');
                }}
                className="flex-1 px-4 py-2 bg-dark-hover hover:bg-dark-border text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
