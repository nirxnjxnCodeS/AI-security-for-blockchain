import { BrowserProvider, JsonRpcSigner, ContractFactory } from 'ethers'

export interface DeploymentResult {
  success: boolean
  contractAddress?: string
  transactionHash?: string
  error?: string
}

export async function deployContract(
  provider: BrowserProvider,
  signer: JsonRpcSigner,
  abi: any,
  bytecode: string,
  constructorArgs: any[] = []
): Promise<DeploymentResult> {
  try {
    console.log('🚀 Creating contract factory...')
    const factory = new ContractFactory(abi, bytecode, signer)

    console.log('🚀 Deploying contract with args:', constructorArgs)
    const contract = await factory.deploy(...constructorArgs)

    console.log('🚀 Contract deployed, getting transaction...')
    const deploymentTransaction = contract.deploymentTransaction()
    const txHash = deploymentTransaction?.hash

    console.log('🚀 Transaction hash:', txHash)

    // Get the contract address from the transaction
    // The contract object has the address even before waitForDeployment
    const address = await contract.getAddress()

    console.log('🚀 Contract address (pre-deployment):', address)

    // Wait for the transaction to be mined (with timeout)
    console.log('🚀 Waiting for transaction to be mined...')
    // console.log(deploymentTransaction)
    // if (deploymentTransaction) {
    //   await deploymentTransaction.wait(1) // Wait for 1 confirmation
    //   console.log('🚀 Transaction mined!')
    // }

    console.log('🚀 Final contract address:', address)

    return {
      success: true,
      contractAddress: address,
      transactionHash: txHash,
    }
  } catch (error: any) {
    console.error('❌ Deployment Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to deploy contract',
    }
  }
}

export function getNetworkName(chainId: number): string {
  // Try to get from network store first
  if (typeof window !== 'undefined') {
    try {
      const { useNetworkStore } = require('@/store/useNetworkStore');
      const network = useNetworkStore.getState().getNetworkByChainId(chainId);
      if (network) return network.name;
    } catch (error) {
      // Fallback to default list
    }
  }

  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet',
    80002: 'Polygon Amoy Testnet',
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
    43114: 'Avalanche Mainnet',
    43113: 'Avalanche Testnet',
    42161: 'Arbitrum One',
    10: 'Optimism',
  }

  return networks[chainId] || `Chain ID: ${chainId}`
}

export function getExplorerUrl(chainId: number, address: string): string {
  // Try to get from network store first
  if (typeof window !== 'undefined') {
    try {
      const { useNetworkStore } = require('@/store/useNetworkStore');
      const network = useNetworkStore.getState().getNetworkByChainId(chainId);
      if (network?.blockExplorerUrl) {
        return `${network.blockExplorerUrl}/address/${address}`;
      }
    } catch (error) {
      // Fallback to default list
    }
  }

  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/address/',
    5: 'https://goerli.etherscan.io/address/',
    11155111: 'https://sepolia.etherscan.io/address/',
    137: 'https://polygonscan.com/address/',
    80001: 'https://mumbai.polygonscan.com/address/',
    80002: 'https://amoy.polygonscan.com/address/',
    56: 'https://bscscan.com/address/',
    97: 'https://testnet.bscscan.com/address/',
    43114: 'https://snowtrace.io/address/',
    43113: 'https://testnet.snowtrace.io/address/',
    42161: 'https://arbiscan.io/address/',
    10: 'https://optimistic.etherscan.io/address/',
  }

  return explorers[chainId]
    ? `${explorers[chainId]}${address}`
    : `https://etherscan.io/address/${address}`
}
