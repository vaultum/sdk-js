/**
 * Vaultum V2 Contract Integration
 * Uses @vaultum/abi for canonical addresses and ABIs
 */

import { ABIS, ADDRESSES, getAddress, type ContractName } from '@vaultum/abi';
import { ethers, type Provider, type Signer } from 'ethers';

/**
 * Get a typed contract instance for any Vaultum contract
 * @param name Contract name
 * @param chainId Network chain ID (e.g., 11155111 for Sepolia)
 * @param provider Ethers provider
 * @param signer Optional signer for write operations
 */
export function getVaultumContract(
  name: ContractName,
  chainId: number,
  provider: Provider,
  signer?: Signer
) {
  const address = getAddress(name, chainId);
  const abi = ABIS[name] as any; // Cast to any to handle ABI typing
  
  if (signer) {
    return new ethers.Contract(address, abi, signer);
  }
  
  return new ethers.Contract(address, abi, provider);
}

/**
 * V2 Contract addresses for all supported networks
 */
export { ADDRESSES as V2_ADDRESSES } from '@vaultum/abi';

/**
 * V2 Contract ABIs for all contracts
 */
export { ABIS as V2_ABIS } from '@vaultum/abi';

/**
 * Sepolia V2 deployment addresses (for convenience)
 */
export const SEPOLIA_V2 = {
  CHAIN_ID: 11155111,
  SMART_ACCOUNT: getAddress('SmartAccount', 11155111),
  SOCIAL_RECOVERY: getAddress('SocialRecoveryModule', 11155111),
  SESSION_VALIDATOR: getAddress('SessionKeyValidator', 11155111),
  SPENDING_LIMITS: getAddress('SpendingLimitModule', 11155111),
} as const;

/**
 * Helper to check if a chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return chainId in ADDRESSES;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChains(): number[] {
  return Object.keys(ADDRESSES).map(Number);
}
