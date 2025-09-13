/**
 * Vaultum SDK Types
 * Auto-generated from OpenAPI specification
 */

export type Chain = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base';

export interface QuoteRequest {
  fromChain: Chain;
  toChain: Chain;
  token: string;
  amount: string;
}

export interface QuoteResponse {
  estimatedFee: string;
  route: {
    path: string[];
    bridges: string[];
    estimatedTime: number;
  };
}

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
}

export interface SubmitRequest {
  chain: Chain;
  userOp: UserOperation;
  signature: string;
}

export interface SubmitResponse {
  id: string;
}

export type OperationState = 'queued' | 'sent' | 'success' | 'failed';

export interface StatusResponse {
  id: string;
  state: OperationState;
  txHash?: string | null;
}

export interface ErrorResponse {
  error: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export interface VaultumClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}
