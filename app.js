let provider;
let signer;

// ✅ Updated ABI (payable constructor)
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
  {
    "inputs": [],
    "name": "DEPLOY_FEE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// ✅ Bytecode from Remix (keep full bytecode here)
const tokenBytecode = "6080604052601260025f6101000a8154..."; // truncated for readability

// ✅ Switch to Abstract Network (chainId 0xab5)
async function switchToAbstract() {
  const ethereum = window.ethereum;
  if (!ethereum) throw new Error("MetaMask not detected");

  const abstractChainId = "0xab5"; // 2741 decimal
  const currentChainId = await ethereum.request({ method: "eth_chainId" });

  if (currentChainId !== abstractChainId) {
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: abstractChainId,
        chainName: "Abstract",
        rpcUrls: ["https://api.mainnet.abs.xyz"],
        nativeCurrency: { name: "ABT", symbol: "ABT", decimals: 18 },
        blockExplorerUrls: ["https://explorer.abstract.network"]
      }]
    });

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: abstractChainId }]
    });
  }
}

// ✅ Deploy Token
document.getElementById("deployForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("status");
  status.textContent = "⏳ Connecting to wallet...";

  try {
    const ethereum = window.ethereum;
    if (!ethereum) {
      status.textContent = "❌ Please install MetaMask or an Abstract-compatible wallet.";
      return;
    }

    // 🔹 Request wallet access
    await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(ethereum);
    signer = await provider.getSigner();

    // Switch network
    status.textContent = "🌐 Switching to Abstract network...";
    await switchToAbstract();

    // Collect input values
    const name = document.getElementById("tokenName").value;
    const symbol = document.getElementById("tokenSymbol").value;
    const supply = document.getElementById("totalSupply").value;

    // Deploy contract
    const factory = new ethers.ContractFactory(tokenABI, tokenBytecode, signer);
    const deployFee = "0.001"; // 0.001 ABT
    status.textContent = `🚀 Deploying your token... (Fee: ${deployFee} ABT + 1% token share to owner)`;

    const contract = await factory.deploy(name, symbol, supply, {
      value: ethers.parseEther(deployFee)
    });

    status.textContent = "⏳ Waiting for deployment confirmation...";
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
