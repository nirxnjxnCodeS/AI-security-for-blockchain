import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NetworkConfig {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isDefault?: boolean;
}

interface NetworkState {
  networks: NetworkConfig[];
  selectedNetwork: NetworkConfig | null;
  addNetwork: (network: Omit<NetworkConfig, 'id'>) => void;
  removeNetwork: (id: string) => void;
  setSelectedNetwork: (network: NetworkConfig) => void;
  getNetworkByChainId: (chainId: number) => NetworkConfig | undefined;
}

// Default networks
const defaultNetworks: NetworkConfig[] = [
  {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'polygon',
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'polygon-amoy',
    name: 'Polygon Amoy Testnet',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorerUrl: 'https://amoy.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'bsc',
    name: 'BSC Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'bsc-testnet',
    name: 'BSC Testnet',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isDefault: true,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isDefault: true,
  },
];

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      networks: defaultNetworks,
      selectedNetwork: defaultNetworks[1], // Sepolia by default

      addNetwork: (network) => {
        const newNetwork: NetworkConfig = {
          ...network,
          id: `custom-${Date.now()}`,
          isDefault: false,
        };

        set((state) => ({
          networks: [...state.networks, newNetwork],
        }));
      },

      removeNetwork: (id) => {
        const network = get().networks.find((n) => n.id === id);
        if (network?.isDefault) {
          throw new Error('Cannot remove default networks');
        }

        set((state) => ({
          networks: state.networks.filter((n) => n.id !== id),
          selectedNetwork:
            state.selectedNetwork?.id === id ? defaultNetworks[1] : state.selectedNetwork,
        }));
      },

      setSelectedNetwork: (network) => {
        set({ selectedNetwork: network });
      },

      getNetworkByChainId: (chainId) => {
        return get().networks.find((n) => n.chainId === chainId);
      },
    }),
    {
      name: 'web3-networks',
    }
  )
);
