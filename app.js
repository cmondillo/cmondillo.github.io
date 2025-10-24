const provider = new ethers.BrowserProvider(window.ethereum);
const tokenABI = [
  "constructor(string memory name_, string memory symbol_, uint256 initialSupply_)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

// Paste your compiled bytecode from Remix here:
const tokenBytecode = "PASTE_YOUR_COMPILED_BYTECODE_HERE";

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
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Add Abstract network if needed
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0xABSTRACT_CHAIN_ID",
        chainName: "Abstract",
        rpcUrls: ["https://api.mainnet.abs.xyz"],
        nativeCurrency: { name: "ABT", symbol: "ABT", decimals: 18 },
        blockExplorerUrls: ["https://explorer.abstract.network"]
      }]
    });

    const signer = await provider.getSigner();
    const factory = new ethers.ContractFactory(tokenABI, tokenBytecode, signer);

    status.textContent = "🚀 Deploying your token, please confirm in wallet...";

    const contract = await factory.deploy(name, symbol, supply);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    status.textContent = `✅ Token deployed successfully!\n\nAddress: ${address}\nName: ${name}\nSymbol: ${symbol}\nTotal Supply: ${supply}`;
  } catch (err) {
    console.error(err);
    status.textContent = `❌ Error: ${err.message}`;
  }
});
