'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Network, Link, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNetworkStore } from '@/store/useNetworkStore';

interface AddNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNetworkModal({ isOpen, onClose }: AddNetworkModalProps) {
  const { addNetwork } = useNetworkStore();
  const [formData, setFormData] = useState({
    name: '',
    chainId: '',
    rpcUrl: '',
    blockExplorerUrl: '',
    currencyName: '',
    currencySymbol: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.chainId || !formData.rpcUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    const chainId = parseInt(formData.chainId);
    if (isNaN(chainId) || chainId <= 0) {
      toast.error('Invalid Chain ID');
      return;
    }

    try {
      addNetwork({
        name: formData.name,
        chainId,
        rpcUrl: formData.rpcUrl,
        blockExplorerUrl: formData.blockExplorerUrl || '',
        nativeCurrency: {
          name: formData.currencyName || 'ETH',
          symbol: formData.currencySymbol || 'ETH',
          decimals: 18,
        },
      });

      toast.success('Network added successfully!');
      onClose();
      setFormData({
        name: '',
        chainId: '',
        rpcUrl: '',
        blockExplorerUrl: '',
        currencyName: '',
        currencySymbol: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add network');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-dark-card to-dark-bg border-2 border-primary/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-dark-border">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-dark-hover rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Plus className="text-primary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add Custom Network</h2>
                    <p className="text-sm text-gray-400">Configure a new blockchain network</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Network Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Network Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Network className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., My Custom Network"
                      className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Chain ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chain ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.chainId}
                    onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                    placeholder="e.g., 1"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for the blockchain network</p>
                </div>

                {/* RPC URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    RPC URL <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={formData.rpcUrl}
                      onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">The RPC endpoint to connect to the network</p>
                </div>

                {/* Block Explorer URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Block Explorer URL (Optional)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={formData.blockExplorerUrl}
                      onChange={(e) => setFormData({ ...formData, blockExplorerUrl: e.target.value })}
                      placeholder="https://etherscan.io"
                      className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency Name
                    </label>
                    <input
                      type="text"
                      value={formData.currencyName}
                      onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
                      placeholder="Ether"
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.currencySymbol}
                      onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                      placeholder="ETH"
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-dark-hover hover:bg-dark-border text-white rounded-xl transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Network
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
