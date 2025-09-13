# Vaultum SDK for JavaScript/TypeScript

TypeScript SDK for the Vaultum cross-chain account abstraction wallet.

## Installation

```bash
npm install @vaultum/sdk-js
# or
pnpm add @vaultum/sdk-js
# or
yarn add @vaultum/sdk-js
```

## Usage

### Basic Setup

```typescript
import { createClient } from '@vaultum/sdk-js';

// Use environment variable with fallback to localhost
const client = createClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

// With additional options
const clientWithOptions = createClient('https://api.vaultum.io', {
  headers: {
    'X-API-Key': 'your-api-key' // Optional
  },
  timeout: 30000 // Optional, defaults to 30s
});
```

### Get a Quote

```typescript
const quote = await client.quoteOp({
  fromChain: 'ethereum',
  toChain: 'polygon',
  token: '0x0000000000000000000000000000000000000000', // Native token
  amount: '1000000000000000000' // 1 ETH in wei
});

console.log(`Estimated fee: ${quote.estimatedFee}`);
console.log(`Route: ${quote.route.path.join(' -> ')}`);
console.log(`Estimated time: ${quote.route.estimatedTime}s`);
```

### Submit a UserOperation

```typescript
const submission = await client.submitOp({
  chain: 'ethereum',
  userOp: {
    sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    nonce: '0',
    initCode: '0x',
    callData: '0xb61d27f6...',
    callGasLimit: '100000',
    verificationGasLimit: '100000',
    preVerificationGas: '21000',
    maxFeePerGas: '1000000000',
    maxPriorityFeePerGas: '1000000000',
    paymasterAndData: '0x'
  },
  signature: '0x...' // 65 bytes signature
});

console.log(`Operation ID: ${submission.id}`);
```

### Check Operation Status

```typescript
const status = await client.getOpStatus('550e8400-e29b-41d4-a716-446655440000');

console.log(`State: ${status.state}`);
if (status.txHash) {
  console.log(`Transaction hash: ${status.txHash}`);
}
```

### Wait for Operation Completion

```typescript
const finalStatus = await client.waitForOperation(operationId, {
  pollingInterval: 2000, // Check every 2 seconds
  maxAttempts: 60, // Maximum 60 attempts (2 minutes)
  onStatusChange: (status) => {
    console.log(`Operation state: ${status.state}`);
  }
});

if (finalStatus.state === 'success') {
  console.log(`Transaction successful: ${finalStatus.txHash}`);
} else {
  console.log('Transaction failed');
}
```

## Error Handling

```typescript
import { VaultumError } from '@vaultum/sdk-js';

try {
  const quote = await client.quoteOp({
    fromChain: 'ethereum',
    toChain: 'polygon',
    token: 'invalid-address',
    amount: '1000000000000000000'
  });
} catch (error) {
  if (error instanceof VaultumError) {
    console.error(`Error: ${error.message}`);
    console.error(`Status code: ${error.statusCode}`);
    
    // For validation errors
    if (error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        console.error(`${field}: ${messages.join(', ')}`);
      }
    }
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions:

```typescript
import type {
  Chain,
  QuoteRequest,
  QuoteResponse,
  UserOperation,
  SubmitRequest,
  SubmitResponse,
  StatusResponse,
  OperationState
} from '@vaultum/sdk-js';
```

## Available Chains

- `ethereum`
- `polygon`
- `arbitrum`
- `optimism`
- `base`

## Operation States

- `queued` - Operation is in the queue
- `sent` - Operation has been sent to the blockchain
- `success` - Operation completed successfully
- `failed` - Operation failed

## Development

```bash
# Install dependencies
pnpm install

# Build the SDK
pnpm build

# Run tests
pnpm test

# Watch mode for development
pnpm dev
```

## License

MIT
