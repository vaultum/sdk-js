# @vaultum/sdk

TypeScript SDK for Vaultum Smart Account - ERC-4337 Account Abstraction Wallet

## Installation

```bash
npm install @vaultum/sdk
# or
yarn add @vaultum/sdk
# or
pnpm add @vaultum/sdk
```

## Quick Start

```typescript
import { VaultumClient } from '@vaultum/sdk';

// Initialize client
const client = new VaultumClient({
  apiKey: 'your-api-key',
  network: 'sepolia'
});

// Deploy a smart account
const account = await client.deployAccount({
  owner: '0x...',
  modules: ['social-recovery', 'session-keys', 'spending-limits']
});

// Submit a UserOperation
const opId = await client.submitUserOp({
  account: account.address,
  calls: [
    {
      to: '0x...',
      value: '0',
      data: '0x...'
    }
  ]
});

// Check operation status
const status = await client.getOpStatus(opId);
```

## Features

- 🔐 **Smart Account Management**: Deploy and manage ERC-4337 smart accounts
- 🔑 **Session Keys**: Grant time-bound, limited permissions
- 👥 **Social Recovery**: Recover accounts with guardian approvals
- 💰 **Spending Limits**: Set daily spending caps per token
- ⛽ **Gasless Transactions**: Submit UserOps with paymaster support
- 🔗 **Cross-chain Support**: Works on Ethereum, Polygon, Arbitrum, Optimism, Base

## API Documentation

### Account Management

```typescript
// Deploy new account
const account = await client.deployAccount(params);

// Get account info
const info = await client.getAccount(address);
```

### UserOperations

```typescript
// Submit UserOp
const opId = await client.submitUserOp(userOp);

// Get status
const status = await client.getOpStatus(opId);

// Wait for completion
const receipt = await client.waitForOp(opId);
```

### Recovery Module

```typescript
// Initiate recovery
await client.initiateRecovery(account, newOwner);

// Support recovery
await client.supportRecovery(account, nonce);

// Execute recovery
await client.executeRecovery(account, nonce);
```

### Session Keys

```typescript
// Grant session key
await client.grantSessionKey(account, key, expiry, selectors);

// Revoke session key
await client.revokeSessionKey(account, key);
```

### Spending Limits

```typescript
// Set limit
await client.setSpendingLimit(account, token, cap);

// Enable owner bypass
await client.enableOwnerBypass(account, duration);
```

## Networks Supported

- Ethereum Mainnet
- Ethereum Sepolia (testnet)
- Polygon
- Arbitrum
- Optimism
- Base

## Requirements

- Node.js 16+
- TypeScript 5.0+ (for TypeScript users)

## License

MIT

## Links

- [GitHub Repository](https://github.com/vaultum/vaultum)
- [Documentation](https://docs.vaultum.io)
- [Discord Community](https://discord.gg/vaultum)

## Support

For issues and feature requests, please visit our [GitHub Issues](https://github.com/vaultum/vaultum/issues).