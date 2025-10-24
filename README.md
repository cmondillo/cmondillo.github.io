# Abstract Token Deployer

A free GitHub Pages app to deploy your own ERC-20–style token on the Abstract blockchain.

## How it works
- Connects to your wallet (MetaMask / Abstract wallet)
- Lets you enter a name, symbol, and total supply
- Deploys the token directly from your browser using Ethers.js

## Setup
1. Fork this repo or upload these files.
2. Enable GitHub Pages in the repo settings.
3. Visit your `https://<username>.github.io/abstract-token-deployer`.
4. Make sure you update:
   - `tokenBytecode`
   - RPC and chain ID for Abstract in `app.js`
