'use client';

import { useNetworkStore, NetworkConfig } from '@/store/useNetworkStore';
import { useWalletStore } from '@/store/useWalletStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  ChevronDown,
  Plus,
  Check,
  Trash2,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import AddNetworkModal from './AddNetworkModal';

export default function NetworkSwitcher() {
  const { networks, selectedNetwork, setSelectedNetwork, removeNetwork, getNetworkByChainId } = useNetworkStore();
  const { chainId, switchNetwork, isConnected } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentNetwork = chainId ? getNetworkByChainId(chainId) : selectedNetwork;

  const handleSwitchNetwork = async (network: NetworkConfig) => {
    if (!isConnected) {
      setSelectedNetwork(network);
      setIsOpen(false);
      toast.success(`Selected ${network.name}`);
      return;
    }

    try {
      // Try to switch network in MetaMask
      await switchNetwork(network.chainId);
      setSelectedNetwork(network);
      setIsOpen(false);
      toast.success(`Switched to ${network.name}`);
    } catch (error: any) {
      // If network doesn't exist in MetaMask, try to add it
      if (error.code === 4902 || error.message?.includes('Unrecognized chain')) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${network.chainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: network.blockExplorerUrl ? [network.blockExplorerUrl] : [],
              },
            ],
          });
          setSelectedNetwork(network);
          setIsOpen(false);
          toast.success(`Added and switched to ${network.name}`);
        } catch (addError: any) {
          toast.error(addError.message || 'Failed to add network');
        }
      } else {
        toast.error(error.message || 'Failed to switch network');
      }
    }
  };

  const handleRemoveNetwork = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      removeNetwork(id);
      toast.success('Network removed');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-card hover:bg-dark-hover text-white rounded-lg transition-all duration-200 border border-dark-border"
        >
          <Network size={18} className="text-primary" />
          <span className="font-medium">{currentNetwork?.name || 'Select Network'}</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {/* Header */}
                <div className="p-4 border-b border-dark-border bg-dark-bg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings size={18} className="text-gray-400" />
                      <h3 className="font-semibold text-white">Select Network</h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddModal(true);
                        setIsOpen(false);
                      }}
                      className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors text-primary"
                      title="Add Custom Network"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Networks List */}
                <div className="max-h-96 overflow-y-auto">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => handleSwitchNetwork(network)}
                      className="w-full px-4 py-3 hover:bg-dark-hover transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            currentNetwork?.chainId === network.chainId
                              ? 'bg-success animate-pulse'
                              : 'bg-gray-600'
                          }`}
                        />
                        <div className="text-left flex-1">
                          <p className="text-white font-medium flex items-center gap-2">
                            {network.name}
                            {network.isDefault && (
                              <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            Chain ID: {network.chainId} • {network.nativeCurrency.symbol}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentNetwork?.chainId === network.chainId && (
                          <Check size={16} className="text-success" />
                        )}
                        {!network.isDefault && (
                          <button
                            onClick={(e) => handleRemoveNetwork(e, network.id)}
                            className="p-1 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-dark-border bg-dark-bg">
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all font-medium text-sm"
                  >
                    <Plus size={16} />
                    Add Custom Network
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AddNetworkModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}
