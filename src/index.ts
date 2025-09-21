/**
 * @vaultum/sdk-js
 * TypeScript SDK for Vaultum smart wallet
 */

// Main client
export { VaultumClient, VaultumError } from './VaultumClient';
export type { VaultumConfig, DeployAccountOptions, SessionKeyOptions, RecoveryOptions } from './VaultumClient';

// Generated API client
export { VaultumAPIClient } from './generated/client';
export type { UserOperation, OperationState, OperationStatus, SubmitResponse } from './generated/client';

// V2 Contract integration with canonical ABIs and addresses
export { 
  getVaultumContract, 
  V2_ADDRESSES, 
  V2_ABIS, 
  SEPOLIA_V2,
  isSupportedChain,
  getSupportedChains 
} from './contracts';
export type { ContractName } from '@vaultum/abi';

// Legacy exports (if client.ts exists)
// export { submitOp, getOpStatus, waitForOp } from './client';
// export type { WaitOptions } from './client';

// Constants
export const CHAINS = {
  ETHEREUM: 'ethereum',
  ARBITRUM: 'arbitrum',
  OPTIMISM: 'optimism',
  POLYGON: 'polygon',
  BASE: 'base',
  SEPOLIA: 'sepolia',
} as const;

export const MODULES = {
  SOCIAL_RECOVERY: 'socialRecovery',
  SESSION_KEYS: 'sessionKeys',
  SPENDING_LIMITS: 'spendingLimits',
} as const;

// Version
export const VERSION = '0.1.0-alpha';