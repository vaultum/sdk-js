# Vaultum JavaScript SDK

![Tests](https://github.com/vaultum/sdk-js/workflows/JavaScript%20SDK%20Tests/badge.svg)
[![npm version](https://badge.fury.io/js/@vaultum%2Fsdk-js.svg)](https://badge.fury.io/js/@vaultum%2Fsdk-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📦 Installation

```bash
# npm
npm install @vaultum/sdk-js

# yarn
yarn add @vaultum/sdk-js

# pnpm
pnpm add @vaultum/sdk-js
```

## 🚀 Quick Start

```typescript
import { VaultumClient } from '@vaultum/sdk-js';

// Initialize client
const client = new VaultumClient({
  apiUrl: 'https://api.vaultum.app',
  chain: 'ethereum', // or 'polygon', 'arbitrum', etc.
});

// Create a smart account
const account = await client.createAccount({
  owner: '0xYourAddress',
  modules: ['sessionKeys', 'spendingLimits'],
});

// Build and send a user operation
const userOp = await client.buildUserOperation({
  account: account.address,
  to: '0xRecipient',
  value: '1000000000000000000', // 1 ETH
  data: '0x',
});

// Submit the operation
const result = await client.submitUserOperation(userOp);

// Wait for confirmation
const receipt = await client.waitForOperation(result.id);
```

## ✨ Features

- **TypeScript Support** - Full type safety and IntelliSense
- **Account Abstraction** - ERC-4337 UserOperation building
- **Session Keys** - Temporary key management
- **Gas Abstraction** - Paymaster integration
- **Multi-chain** - Support for multiple EVM chains
- **Retry Logic** - Automatic retry with exponential backoff
- **WebSocket Support** - Real-time operation updates

## 📚 API Reference

### VaultumClient

The main client for interacting with Vaultum smart accounts.

```typescript
const client = new VaultumClient(config: ClientConfig);
```

#### Configuration

```typescript
interface ClientConfig {
  apiUrl: string;           // Vaultum API URL
  chain: Chain;             // Target blockchain
  signer?: Signer;          // Ethers.js signer
  paymasterUrl?: string;    // Optional paymaster
}
```

### Account Management

#### Create Account

```typescript
const account = await client.createAccount({
  owner: string,
  modules?: string[],
  salt?: string,
});
```

#### Get Account

```typescript
const account = await client.getAccount(address: string);
```

### User Operations

#### Build UserOperation

```typescript
const userOp = await client.buildUserOperation({
  account: string,
  to: string,
  value?: string,
  data?: string,
  nonce?: string,
});
```

#### Sign UserOperation

```typescript
const signedOp = await client.signUserOperation(
  userOp: UserOperation,
  signer: Signer
);
```

#### Submit UserOperation

```typescript
const result = await client.submitUserOperation(
  signedOp: SignedUserOperation
);
```

### Session Keys

#### Create Session Key

```typescript
const sessionKey = await client.createSessionKey({
  account: string,
  permissions: Permission[],
  expiry: number,
});
```

#### Use Session Key

```typescript
const client = new VaultumClient({
  // ... config
  sessionKey: sessionKey.privateKey,
});
```

### Gas Estimation

```typescript
const estimate = await client.estimateUserOperation(userOp);
console.log('Gas limit:', estimate.callGasLimit);
console.log('Verification gas:', estimate.verificationGasLimit);
```

## 🔄 WebSocket Events

```typescript
// Subscribe to operation updates
client.on('operation', (update) => {
  console.log('Operation status:', update.status);
});

// Subscribe to account events
client.on('account', (event) => {
  console.log('Account event:', event.type);
});
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## 🔧 Advanced Usage

### Custom Signer

```typescript
import { Wallet } from 'ethers';

const signer = new Wallet(privateKey);
const client = new VaultumClient({
  apiUrl: 'https://api.vaultum.app',
  chain: 'ethereum',
  signer,
});
```

### Batch Operations

```typescript
const batch = await client.batchUserOperations([
  { to: addr1, value: amount1, data: data1 },
  { to: addr2, value: amount2, data: data2 },
]);
```

### Custom Modules

```typescript
await client.addModule({
  account: accountAddress,
  module: moduleAddress,
  initData: '0x...',
});
```

## 🌐 Supported Chains

- Ethereum Mainnet
- Polygon
- Arbitrum One
- Optimism
- Base
- Avalanche C-Chain
- BNB Smart Chain

## 🛡️ Security

- All sensitive operations require signatures
- Session keys have limited permissions
- Automatic nonce management
- Replay protection built-in

## 📊 Bundle Size

| Format | Size (gzipped) |
|--------|---------------|
| ESM | 12.5 KB |
| CJS | 13.2 KB |
| UMD | 14.1 KB |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://docs.vaultum.app/sdk-js)
- [API Reference](https://api.vaultum.app/docs)
- [Examples](https://github.com/vaultum/sdk-js/tree/main/examples)
- [Discord](https://discord.gg/vaultum)

---

Built with ❤️ by the Vaultum team