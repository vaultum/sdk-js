/**
 * Vaultum SDK for JavaScript/TypeScript
 * 
 * Cross-chain account abstraction wallet SDK
 */

// Import first for the factory function
import { VaultumClient } from './client';

// Re-export everything
export { VaultumClient, VaultumError } from './client';
export * from './types';

// Convenience factory function
export function createClient(baseUrl: string, options?: {
  headers?: Record<string, string>;
  timeout?: number;
}) {
  return new VaultumClient({
    baseUrl,
    ...options
  });
}

// Re-export common types for convenience
export type { VaultumClientOptions } from './types';
