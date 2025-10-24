import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);

// ✅ Updated ABI (includes payable constructor)
const tokenABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name_", "type": "string" },
      { "internalType": "string", "name": "symbol_", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply_", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// ✅ Truncated bytecode from Remix (don’t replace unless contract changes)
const tokenBytecode = "0x6080...0033"; // shortened for readability

// ✅ Switch to Abstract Network (chainId 0xab5)
async function switchToAbstract() {
  const abstractChainId = "0xab5"; // 2741 decimal
  try {
    const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
    if (currentChainId !== abstractChainId) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: abstractChainId,
          chainName: "Abstract",
          rpcUrls: ["https://api.mainnet.abs.xyz"],
          nativeCurrency: { name: "ABT", symbol: "ABT", decimals: 18 },
          blockExplorerUrls: ["https://explorer.abstract.network"]
        }]
      });
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: abstractChainId }]
      });
    }
  } catch (err) {
    throw new Error("Failed to switch network: " + err.message);
  }
}

// ✅ Deploy Token Button / Form Logic
document.getElementById("deployForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("status");
  const name = document.getElementById("tokenName").value;
  const symbol = document.getElementById("tokenSymbol").value;
  const supply = document.getElementById("totalSupply").value;

  if (!window.ethereum) {
    status.textContent = "❌ Please install MetaMask or an Abstract-compatible wallet.";
    return;
  }

  try {
    // Request wallet access
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Switch to Abstract
    status.textContent = "🌐 Switching to Abstract network...";
    await switchToAbstract();

    // Connect signer
    const signer = await provider.getSigner();

    // Create contract factory
    const factory = new ethers.ContractFactory(tokenABI, tokenBytecode, signer);

    // ✅ 0.001 ABT deployment fee
    const deployFee = "0.001";

    // Deploy contract
    status.textContent = `🚀 Deploying your token... (Fee: ${deployFee} ABT + 1% token share to owner)`;
    const contract = await factory.deploy(name, symbol, supply, {
      value: ethers.parseEther(deployFee)
    });

    // Wait for deployment
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    status.textContent =
      `✅ Token deployed successfully!\n\n` +
      `📄 Address: ${address}\n` +
      `🏷️ Name: ${name}\n` +
      `💠 Symbol: ${symbol}\n` +
      `🔢 Total Supply: ${supply}\n\n` +
      `💸 0.001 ABT fee sent to owner.\n` +
      `📈 Owner automatically received 1% of the new token supply.`;
  } catch (err) {
    console.error(err);
    status.textContent = `❌ Error: ${err.message}`;
  }
});
