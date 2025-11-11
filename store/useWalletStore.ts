import { create } from 'zustand';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

interface WalletState {
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  chainId: null,
  provider: null,
  signer: null,
  isConnected: false,
  isConnecting: false,

  connectWallet: async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    set({ isConnecting: true });

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      set({
        address: accounts[0],
        chainId: currentChainId,
        provider,
        signer,
        isConnected: true,
        isConnecting: false,
      });

      // Sync with network store - set selected network to match wallet's current network
      try {
        const { useNetworkStore } = require('@/store/useNetworkStore');
        const networkStore = useNetworkStore.getState();
        const matchingNetwork = networkStore.getNetworkByChainId(currentChainId);

        if (matchingNetwork) {
          networkStore.setSelectedNetwork(matchingNetwork);
        }
      } catch (error) {
        console.warn('Could not sync with network store:', error);
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnectWallet();
        } else {
          set({ address: accounts[0] });
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', async (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);

        // Update wallet store
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        set({ chainId: newChainId, provider, signer });

        // Sync with network store
        try {
          const { useNetworkStore } = require('@/store/useNetworkStore');
          const networkStore = useNetworkStore.getState();
          const matchingNetwork = networkStore.getNetworkByChainId(newChainId);

          if (matchingNetwork) {
            networkStore.setSelectedNetwork(matchingNetwork);
          }
        } catch (error) {
          console.warn('Could not sync with network store:', error);
        }
      });
    } catch (error) {
      set({ isConnecting: false });
      throw error;
    }
  },

  disconnectWallet: () => {
    set({
      address: null,
      chainId: null,
      provider: null,
      signer: null,
      isConnected: false,
      isConnecting: false,
    });
  },

  switchNetwork: async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Network not added to MetaMask');
      }
      throw error;
    }
  },
}));

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
