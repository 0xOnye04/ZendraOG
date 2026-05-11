# ZendraOG

ZendraOG is a multi-chain crypto dashboard with a separate AI Trader page. It tracks wallets across major chains, scores portfolio risk, stores analysis on 0G Storage, and runs a conversational trading mentor through 0G Compute Direct.

## What It Does

The current app has two main parts:

### 1. Dashboard

The dashboard lets users:

- track wallets on Ethereum, Arbitrum, BSC, and Solana
- inspect portfolio value, asset concentration, and stablecoin share
- generate wallet insights and risk classifications
- view market prices and trending token data
- store wallet analysis results on 0G Storage
- store dashboard backup snapshots on 0G Storage

### 2. AI Trader

The AI Trader page is a separate mentor workspace that lets users:

- connect a trader wallet with MetaMask preferred
- chat with a conversational trading mentor
- save user preferences, strategy notes, journal notes, and chat history
- persist mentor memory and analysis artifacts on 0G Storage
- run real inference through live 0G Compute providers
- inspect readiness before prompting:
  - connected trader wallet
  - current 0G network
  - selected provider
  - sub-account status
  - verification availability

## 0G Components Used

This project currently uses:

- `0G Storage`
- `0G Compute Direct`

### 0G Storage

Storage is implemented with:

- `@0gfoundation/0g-storage-ts-sdk`

The app stores:

- wallet analysis results
- dashboard snapshots
- AI chat history
- user preferences
- strategy memory
- trade journal entries
- AI context memory
- trade analysis logs

Main storage files:

- `src/services/ogStorage.js`
- `src/services/ogStorage.ts`
- `src/zgStorage.js`

### 0G Compute

Compute is implemented with:

- `@0gfoundation/0g-compute-ts-sdk`

The AI Trader currently uses the official Direct flow:

- `createZGComputeNetworkBroker`
- provider listing via `listServiceWithDetail(...)`
- provider metadata via `getServiceMetadata(...)`
- authenticated headers via `getRequestHeaders(...)`
- real `/chat/completions` requests against provider endpoints
- optional response verification via `processResponse(...)`

Main compute files:

- `src/services/ogCompute.ts`
- `src/services/aiMentor.ts`
- `src/aiTrader.js`
- `ai-trader.html`

## Current Runtime Behavior

This is the important part for the current build.

### Dashboard storage flow

When wallet analysis runs successfully, the app can store:

- wallet analysis payloads through `storeWalletAnalysisResults(...)`
- dashboard snapshots through `storeDashboardSnapshot(...)`

### AI Trader compute flow

The AI Trader does not use fake local AI responses.

It currently:

- connects a real wallet signer
- resolves a live 0G chatbot provider
- checks provider readiness
- checks whether a provider sub-account exists for the connected wallet
- sends a real Direct compute request if ready

### Important compute caveat

The AI Trader can still fail even if the wallet has enough testnet `0G`, because Direct Compute also depends on:

- a healthy provider
- a supported provider model
- a funded provider sub-account for the connected wallet

So wallet balance alone is not enough for Direct Compute success.

## Current Testnet Configuration

The current code is configured around `0G Galileo Testnet`.

Storage / compute related values in use:

- Compute RPC: `https://evmrpc-testnet.0g.ai`
- Storage Indexer: `https://indexer-storage-testnet-turbo.0g.ai`
- Storage EVM RPC: `https://evmrpc-testnet.0g.ai`
- Supported chain IDs in the app: `16601` and `16602`

## Verified 0G Storage Proof

Current verified testnet proof captured from the working app:

- Root hash: `0x8b6454d712884dfa03eb20fc85593a0bd048c61787565e5e70bac90249962e87`
- Transaction hash: `0xf042cedcdff27759c871e8c27c1be0cbd3a53b79fb78ff27723d1e2f20ca4841`

Explorer references:

- Storage Scan: `https://storagescan-galileo.0g.ai`
- Chain Explorer: `https://chainscan-galileo.0g.ai`

Observed contract / flow address from the current working test flow:

- `0x22E03a6A89B950F1c82ec5e74F8eCa321a105296`

## Current Project Structure

### Frontend

- `index.html` for the dashboard shell
- `ai-trader.html` for the AI Trader page
- `src/style.css` for both surfaces

### Core app files

- `src/main.js` powers the dashboard
- `src/aiTrader.js` powers the mentor page
- `src/services/aiMentor.ts` builds mentor context and local memory
- `src/services/ogCompute.ts` handles Direct 0G Compute
- `src/services/ogStorage.js` handles 0G Storage writes

## Dependencies

Current main dependencies:

- `@0gfoundation/0g-compute-ts-sdk`
- `@0gfoundation/0g-storage-ts-sdk`
- `ethers`

Dev tooling:

- `vite`
- `vite-plugin-node-polyfills`

## Local Development

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Runtime Config

The app reads config from `window.ZENDRA_CONFIG`, localStorage, or Vite env values.

### Compute

- `ogComputeRpcUrl` or `VITE_OG_COMPUTE_RPC_URL`
- `ogComputeModel` or `VITE_OG_COMPUTE_MODEL`
- `ogComputeProviderAddress` or `VITE_OG_COMPUTE_PROVIDER_ADDRESS`

### Storage

- `ogIndexerRpc` or `VITE_OG_INDEXER_RPC`
- `ogEvmRpc` or `VITE_OG_EVM_RPC`

### CoinGecko

- `coingeckoDemoApiKey` or `VITE_COINGECKO_DEMO_API_KEY`
- `coingeckoProApiKey` or `VITE_COINGECKO_PRO_API_KEY`

### Solana

- `solanaRpc` or `VITE_SOLANA_RPC`
- `solanaRpcFallbacks` or `VITE_SOLANA_RPC_FALLBACKS`

## Current Limitations

The current build is working, but there are still real-world constraints:

- Direct Compute depends on provider health
- provider sub-accounts must exist and be funded per connected wallet
- the chosen provider may only support a specific model
- some on-chain compute/storage transactions may fail depending on current network/provider state

The app now surfaces those issues in the AI Trader UI through readiness, identity, provider, and compute panels.

## Repository

GitHub:

- `https://github.com/0xOnye04/ZendraOG`
