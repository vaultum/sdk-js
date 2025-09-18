/**
 * Vaultum SDK - Main Client
 * Combines API client with on-chain interactions
 */

import { ethers } from 'ethers';
import type { Signer, Provider, Contract } from 'ethers';
import { VaultumAPIClient } from './generated/client';

// Import ABIs when package is published
// import { SmartAccountABI, Events, Errors } from '@vaultum/abi';

export interface VaultumConfig {
  apiUrl: string;
  apiKey?: string;
  provider: Provider;
  signer?: Signer;
}

export interface DeployAccountOptions {
  owner: string;
  salt?: string;
  modules?: ('socialRecovery' | 'sessionKeys' | 'spendingLimits')[];
}

export interface SessionKeyOptions {
  address: string;
  expiry: number;
  allowedSelectors?: string[];
}

export interface RecoveryOptions {
  newOwner: string;
  guardian: string;
  signature: string;
}

export class VaultumClient {
  private api: VaultumAPIClient;
  private provider: Provider;
  private signer?: Signer;
  
  constructor(config: VaultumConfig) {
    this.api = new VaultumAPIClient(config.apiUrl, config.apiKey);
    this.provider = config.provider;
    this.signer = config.signer;
  }
  
  // ============ Account Management ============
  
  async deployAccount(options: DeployAccountOptions) {
    const chain = await this.getChainName();
    return this.api.deployAccount(
      options.owner,
      chain,
      options.modules,
      options.salt
    );
  }
  
  async getAccountContract(address: string): Promise<Contract> {
    if (!this.signer) throw new Error('Signer required for contract interaction');
    
    // TODO: Use SmartAccountABI from @vaultum/abi when published
    const abi = ['function execute(address,uint256,bytes)'];
    return new ethers.Contract(address, abi, this.signer);
  }
  
  // ============ User Operations ============
  
  async submitUserOp(userOp: any) {
    const chain = await this.getChainName();
    return this.api.submitOperation(chain, userOp);
  }
  
  async getOpStatus(id: string) {
    return this.api.getOperationStatus(id);
  }
  
  async waitForOp(id: string, timeoutMs: number = 120000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const status = await this.api.waitForOperation(id, { timeout: 30 });
      
      if (status.state === 'success' || status.state === 'failed') {
        return status;
      }
      
      // Small delay before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Operation timeout');
  }
  
  // ============ Social Recovery ============
  
  async addGuardian(account: string, guardian: string) {
    if (!this.signer) throw new Error('Signer required');
    
    const contract = await this.getAccountContract(account);
    // TODO: Call recovery module's addGuardian
    throw new Error('Not implemented - waiting for ABI package');
  }
  
  async initiateRecovery(account: string, options: RecoveryOptions) {
    return this.api.initiateRecovery(
      account,
      options.newOwner,
      options.guardian,
      options.signature
    );
  }
  
  async getRecoveryStatus(account: string) {
    return this.api.getRecoveryStatus(account);
  }
  
  // ============ Session Keys ============
  
  async grantSessionKey(account: string, options: SessionKeyOptions) {
    if (!this.signer) throw new Error('Signer required');
    
    const contract = await this.getAccountContract(account);
    // TODO: Call session key module's grant function
    throw new Error('Not implemented - waiting for ABI package');
  }
  
  async revokeSessionKey(account: string, key: string) {
    if (!this.signer) throw new Error('Signer required');
    
    const contract = await this.getAccountContract(account);
    // TODO: Call session key module's revoke function
    throw new Error('Not implemented - waiting for ABI package');
  }
  
  // ============ Spending Limits ============
  
  async setSpendingLimit(account: string, token: string, limit: string) {
    if (!this.signer) throw new Error('Signer required');
    
    const contract = await this.getAccountContract(account);
    // TODO: Call spending limit module's setLimit function
    throw new Error('Not implemented - waiting for ABI package');
  }
  
  // ============ Utilities ============
  
  private async getChainName(): Promise<string> {
    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const chains: Record<number, string> = {
      1: 'ethereum',
      42161: 'arbitrum',
      10: 'optimism',
      137: 'polygon',
      8453: 'base',
      11155111: 'sepolia'
    };
    
    return chains[chainId] || 'unknown';
  }
  
  async getAccountAddress(owner: string, salt?: string): Promise<string> {
    // TODO: Calculate deterministic address using CREATE2
    throw new Error('Not implemented - waiting for factory contract');
  }
}

export default VaultumClient;

