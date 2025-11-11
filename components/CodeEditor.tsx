'use client';

import Editor from '@monaco-editor/react';
import { useProjectStore } from '@/store/useProjectStore';
import { Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CodeEditor() {
  const { currentProject, updateProject } = useProjectStore();
  const [localCode, setLocalCode] = useState(currentProject?.contractCode || '');

  const handleSave = () => {
    if (!currentProject) return;

    updateProject(currentProject.id, {
      contractCode: localCode,
    });

    toast.success('Contract saved successfully');
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>Select or create a project to start coding</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-card rounded-lg overflow-hidden border border-dark-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg">
        <div>
          <h3 className="text-white font-semibold">{currentProject.name}</h3>
          <p className="text-sm text-gray-400">{currentProject.description}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200"
        >
          <Save size={18} />
          Save
        </button>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="sol"
          value={localCode}
          onChange={(value) => setLocalCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
