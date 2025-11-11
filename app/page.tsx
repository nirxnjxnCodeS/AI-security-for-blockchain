'use client'

import WalletConnect from '@/components/WalletConnect'
import NetworkSwitcher from '@/components/NetworkSwitcher'
import ProjectList from '@/components/ProjectList'
import CodeEditor from '@/components/CodeEditor'
import WorkflowVisualizer from '@/components/WorkflowVisualizer'
import DeploymentPanel from '@/components/DeploymentPanel'
import DeploymentHistory from '@/components/DeploymentHistory'
import { Code2, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="text-primary" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Web3 Workflow</h1>
                <p className="text-sm text-gray-400">Smart Contract Deployment Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NetworkSwitcher />
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Projects */}
          <div className="xl:col-span-3 space-y-6">
            <ProjectList />
            <div className="hidden xl:block">
              <DeploymentHistory />
            </div>
          </div>

          {/* Center - Code Editor */}
          <div className="xl:col-span-6 space-y-6">
            <div className="h-[600px]">
              <CodeEditor />
            </div>
            <DeploymentPanel />

            {/* Mobile/Tablet History */}
            <div className="xl:hidden">
              <DeploymentHistory />
            </div>
          </div>

          {/* Right Sidebar - Workflow */}
          <div className="xl:col-span-3 space-y-6">
            <WorkflowVisualizer />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Code2 size={18} />
              <span className="text-sm">Built with Next.js, Solidity & OpenAI</span>
            </div>
            <div className="text-sm text-gray-500">Powered by Web3 Technology</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
