// Auto-generated API client from OpenAPI spec
// Generated at: 2025-09-21T08:35:37.244Z

import createClient from 'openapi-fetch';
import type { paths } from './api';

export type OperationState = 'queued' | 'sent' | 'success' | 'failed';

export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface SubmitResponse {
  id: string;
  state: OperationState;
}

export interface OperationStatus {
  id: string;
  state: OperationState;
  chain: string;
  userOp: UserOperation;
  txHash?: string | null;
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export class VaultumAPIClient {
  private client: ReturnType<typeof createClient<paths>>;
  
  constructor(baseUrl: string, apiKey?: string) {
    this.client = createClient<paths>({
      baseUrl,
      headers: apiKey ? { 'X-API-Key': apiKey } : {},
    });
  }
  
  async submitOperation(chain: string, userOp: UserOperation): Promise<SubmitResponse> {
    const { data, error } = await this.client.POST('/api/op/submit', {
      body: { 
        chain: chain as "ethereum" | "arbitrum" | "optimism" | "polygon" | "base" | "sepolia",
        userOp 
      }
    });
    
    if (error) throw new Error((error as any).error || 'Failed to submit operation');
    return data!;
  }
  
  async getOperationStatus(id: string): Promise<OperationStatus> {
    const { data, error } = await this.client.GET('/api/op/{id}', {
      params: { path: { id } }
    });
    
    if (error) throw new Error((error as any).error || 'Operation not found');
    return data as OperationStatus;
  }
  
  async waitForOperation(
    id: string, 
    options: { timeout?: number } = {}
  ): Promise<OperationStatus> {
    const { data, error } = await this.client.GET('/api/op/{id}/wait', {
      params: { 
        path: { id },
        query: { timeout: options.timeout || 30 }
      }
    });
    
    if (error) throw new Error((error as any).error || 'Wait failed');
    return data as OperationStatus;
  }
  
  async deployAccount(
    owner: string,
    chain: string,
    modules?: string[],
    salt?: string
  ) {
    const { data, error } = await this.client.POST('/api/account/deploy', {
      body: { 
        owner, 
        chain: chain as "ethereum" | "arbitrum" | "optimism" | "polygon" | "base" | "sepolia",
        modules: modules as ("socialRecovery" | "sessionKeys" | "spendingLimits")[] | undefined,
        salt 
      }
    });
    
    if (error) throw new Error((error as any).error || 'Deploy failed');
    return data!;
  }
  
  async initiateRecovery(
    account: string,
    newOwner: string,
    guardian: string,
    signature: string
  ) {
    const { data, error } = await this.client.POST('/api/recovery/initiate', {
      body: { account, newOwner, guardian, signature }
    });
    
    if (error) throw new Error((error as any).error || 'Recovery initiation failed');
    return data!;
  }
  
  async getRecoveryStatus(account: string) {
    const { data, error } = await this.client.GET('/api/recovery/{account}/status', {
      params: { path: { account } }
    });
    
    if (error) throw new Error((error as any).error || 'Failed to get recovery status');
    return data!;
  }
}

export default VaultumAPIClient;
