'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  ExternalLink,
  Download,
  Copy,
  Rocket,
  Network,
  Hash,
  Clock,
  Shield,
  FileJson,
  FileCode,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getNetworkName, getExplorerUrl } from '@/utils/contract-deployer';
import { downloadJSON, downloadText } from '@/utils/download-helpers';

interface DeploymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: string;
  network: number;
  transactionHash?: string;
  deployedAt: number;
  projectName: string;
  abi?: any;
  bytecode?: string;
  hasSecurityReport?: boolean;
}

export default function DeploymentSuccessModal({
  isOpen,
  onClose,
  contractAddress,
  network,
  transactionHash,
  deployedAt,
  projectName,
  abi,
  bytecode,
  hasSecurityReport,
}: DeploymentSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadABI = () => {
    if (!abi) return;
    downloadJSON(abi, `${projectName}-ABI.json`);
    toast.success('ABI downloaded');
  };

  const handleDownloadBytecode = () => {
    if (!bytecode) return;
    downloadText(bytecode, `${projectName}-Bytecode.txt`);
    toast.success('Bytecode downloaded');
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
              className="bg-gradient-to-br from-dark-card to-dark-bg border-2 border-primary/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-primary/20"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent rounded-t-2xl" />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-dark-hover rounded-lg transition-colors text-gray-400 hover:text-white z-10"
                >
                  <X size={20} />
                </button>

                <div className="relative flex flex-col items-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-success/10 p-4 rounded-full border-2 border-success">
                      <CheckCircle2 className="text-success" size={48} />
                    </div>
                  </motion.div>

                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Deployment Successful!
                    </h2>
                    <p className="text-gray-400">Your smart contract is now live on the blockchain</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Contract Address */}
                <div className="bg-dark-bg rounded-xl p-4 border border-dark-border hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket size={16} className="text-primary" />
                    <p className="text-sm text-gray-400">Contract Address</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-white font-mono text-sm break-all">{contractAddress}</p>
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 hover:bg-dark-hover rounded-lg transition-all"
                    >
                      {copied ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : (
                        <Copy size={18} className="text-gray-400 group-hover:text-primary" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Network */}
                  <div className="bg-dark-bg rounded-xl p-4 border border-dark-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Network size={16} className="text-blue-400" />
                      <p className="text-sm text-gray-400">Network</p>
                    </div>
                    <p className="text-white font-semibold">{getNetworkName(network)}</p>
                  </div>

                  {/* Timestamp */}
                  <div className="bg-dark-bg rounded-xl p-4 border border-dark-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-purple-400" />
                      <p className="text-sm text-gray-400">Deployed At</p>
                    </div>
                    <p className="text-white font-semibold">
                      {new Date(deployedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Transaction Hash */}
                {transactionHash && (
                  <div className="bg-dark-bg rounded-xl p-4 border border-dark-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash size={16} className="text-green-400" />
                      <p className="text-sm text-gray-400">Transaction Hash</p>
                    </div>
                    <p className="text-white font-mono text-sm break-all">{transactionHash}</p>
                  </div>
                )}

                {/* Security Report Badge */}
                {hasSecurityReport && (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-2">
                      <Shield size={18} className="text-yellow-400" />
                      <p className="text-sm text-yellow-200">Security analysis completed</p>
                    </div>
                  </div>
                )}

                {/* Download Options */}
                <div className="bg-dark-bg rounded-xl p-4 border border-dark-border">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Download size={18} className="text-primary" />
                    Download Files
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {abi && (
                      <button
                        onClick={handleDownloadABI}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-card hover:bg-dark-hover border border-dark-border rounded-lg text-white transition-all text-sm"
                      >
                        <FileJson size={16} className="text-blue-400" />
                        <span>ABI</span>
                      </button>
                    )}
                    {bytecode && (
                      <button
                        onClick={handleDownloadBytecode}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-card hover:bg-dark-hover border border-dark-border rounded-lg text-white transition-all text-sm"
                      >
                        <FileCode size={16} className="text-purple-400" />
                        <span>Bytecode</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-dark-hover hover:bg-dark-border text-white rounded-xl transition-all font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.open(getExplorerUrl(network, contractAddress), '_blank')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    View on Explorer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
