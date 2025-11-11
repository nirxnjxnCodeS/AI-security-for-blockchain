'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function WalletConnect() {
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWalletStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
    toast.success('Wallet disconnected');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <Wallet size={20} />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-6 py-3 bg-dark-card hover:bg-dark-hover text-white rounded-lg transition-all duration-200 border border-dark-border font-medium"
      >
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        <span>{formatAddress(address!)}</span>
        <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-dark-border">
            <p className="text-sm text-gray-400">Connected Address</p>
            <p className="text-white font-mono text-sm mt-1 break-all">{address}</p>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-dark-hover transition-colors"
          >
            <LogOut size={18} />
            Disconnect
          </button>
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
