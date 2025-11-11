'use client';

import { useDeploymentHistoryStore, DeploymentRecord } from '@/store/useDeploymentHistoryStore';
import { motion } from 'framer-motion';
import {
  History,
  ExternalLink,
  Trash2,
  Network,
  Clock,
  Shield,
  Search,
  Filter,
  Rocket,
} from 'lucide-react';
import { useState } from 'react';
import { getNetworkName, getExplorerUrl } from '@/utils/contract-deployer';
import DeploymentSuccessModal from './DeploymentSuccessModal';
import toast from 'react-hot-toast';

export default function DeploymentHistory() {
  const { deployments, clearHistory } = useDeploymentHistoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNetwork, setFilterNetwork] = useState<number | null>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRecord | null>(null);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all deployment history?')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  // Get unique networks from deployments
  const uniqueNetworks = Array.from(new Set(deployments.map((d) => d.network)));

  // Filter deployments
  const filteredDeployments = deployments.filter((deployment) => {
    const matchesSearch =
      deployment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deployment.contractAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNetwork = filterNetwork === null || deployment.network === filterNetwork;

    return matchesSearch && matchesNetwork;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <History className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Deployment History</h2>
            <p className="text-sm text-gray-400">{deployments.length} total deployments</p>
          </div>
        </div>
        {deployments.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            title="Clear history"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Search and Filter */}
      {deployments.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project or address..."
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>

          {uniqueNetworks.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterNetwork(null)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    filterNetwork === null
                      ? 'bg-primary text-white'
                      : 'bg-dark-bg text-gray-400 hover:bg-dark-hover'
                  }`}
                >
                  All Networks
                </button>
                {uniqueNetworks.map((network) => (
                  <button
                    key={network}
                    onClick={() => setFilterNetwork(network)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${
                      filterNetwork === network
                        ? 'bg-primary text-white'
                        : 'bg-dark-bg text-gray-400 hover:bg-dark-hover'
                    }`}
                  >
                    {getNetworkName(network).split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deployments List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filteredDeployments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="p-4 bg-dark-bg rounded-full mb-4">
              <Rocket size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 mb-2">
              {searchTerm || filterNetwork !== null
                ? 'No deployments match your filters'
                : 'No deployments yet'}
            </p>
            <p className="text-sm text-gray-500">
              {searchTerm || filterNetwork !== null
                ? 'Try adjusting your search or filters'
                : 'Deploy your first contract to see it here'}
            </p>
          </div>
        ) : (
          filteredDeployments.map((deployment, index) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedDeployment(deployment)}
              className="bg-dark-bg rounded-xl p-4 border border-dark-border hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-semibold truncate">{deployment.projectName}</h3>
                    {deployment.hasSecurityReport && (
                      <div className="relative group/tooltip">
                        <Shield size={14} className="text-yellow-400" />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-dark-card text-xs text-white rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Security analyzed
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-mono text-gray-400 mb-3 truncate">
                    {deployment.contractAddress}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Network size={12} />
                      <span>{deployment.networkName.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(deployment.deployedAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(getExplorerUrl(deployment.network, deployment.contractAddress), '_blank');
                  }}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="View on explorer"
                >
                  <ExternalLink size={16} className="text-primary" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Deployment Detail Modal */}
      {selectedDeployment && (
        <DeploymentSuccessModal
          isOpen={!!selectedDeployment}
          onClose={() => setSelectedDeployment(null)}
          contractAddress={selectedDeployment.contractAddress}
          network={selectedDeployment.network}
          transactionHash={selectedDeployment.transactionHash}
          deployedAt={selectedDeployment.deployedAt}
          projectName={selectedDeployment.projectName}
          abi={selectedDeployment.abi}
          bytecode={selectedDeployment.bytecode}
          hasSecurityReport={selectedDeployment.hasSecurityReport}
        />
      )}
    </div>
  );
}
