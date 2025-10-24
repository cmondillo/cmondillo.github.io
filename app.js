// ✅ Token ABI
const tokenABI = [
  {
    "inputs":[
      {"internalType":"string","name":"name_","type":"string"},
      {"internalType":"string","name":"symbol_","type":"string"},
      {"internalType":"uint256","name":"initialSupply_","type":"uint256"}
    ],
    "stateMutability":"payable",
    "type":"constructor"
  },
  {"inputs":[],"name":"DEPLOY_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
];

// ✅ Shortened placeholder bytecode (replace with full compiled bytecode)
const tokenBytecode = "0x608060405234801561000f57600080fd...";

let provider;
let signer;

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

document.getElementById("deployForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("status");
  status.textContent = "⏳ Connecting wallet...";

  try {
    const ethereum = window.ethereum;
    if (!ethereum) {
      status.textContent = "❌ Install MetaMask or an Abstract-compatible wallet.";
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(ethereum);
    signer = await provider.getSigner(accounts[0]);

    status.textContent = "🌐 Switching to Abstract network...";
    await switchToAbstract();

    const name = document.getElementById("tokenName").value;
    const symbol = document.getElementById("tokenSymbol").value;
    const supply = document.getElementById("totalSupply").value;

    const factory = new ethers.ContractFactory(tokenABI, tokenBytecode, signer);
    const deployFee = "0.001";

    status.textContent = `🚀 Deploying token... Fee: ${deployFee} ABT`;

    const contract = await factory.deploy(
      name,
      symbol,
      supply,
      { value: ethers.parseEther(deployFee) }
    );

    status.textContent = "⏳ Waiting for deployment confirmation...";
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    status.textContent = `✅ Token deployed!\nAddress: ${address}\nName: ${name}\nSymbol: ${symbol}\nSupply: ${supply}`;
  } catch (err) {
    console.error(err);
    status.textContent = `❌ Error: ${err.message}`;
  }
});
