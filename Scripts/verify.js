/**
 * Verification Script – Verify Implementation on Snowtrace
 * Usage: PROXY_ADDRESS=0x... npx hardhat run --network <network> Scripts/verify.js
 *
 * Environment:
 *   PROXY_ADDRESS – Address of the proxy
 *   SNOWTRACE_API_KEY – API key for Snowtrace/Etherscan verification
 */

const { ethers, run } = require("hardhat");
const { erc1967 } = require("@openzeppelin/upgrades-core");
const { verifyContract, getProxyInfo, logDeploymentSummary } = require("./helpers");

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;

  if (!proxyAddress) {
    throw new Error("❌ PROXY_ADDRESS not set in environment.");
  }

  if (!ethers.isAddress(proxyAddress)) {
    throw new Error(`❌ Invalid PROXY_ADDRESS: ${proxyAddress}`);
  }

  const network = await ethers.provider.getNetwork();

  console.log("\n" + "=".repeat(60));
  console.log("🔍 VERIFICATION – INVARIANCE REGISTRY");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Proxy: ${proxyAddress}\n`);

  try {
    // Get proxy info
    const proxyInfo = await getProxyInfo(proxyAddress);

    logDeploymentSummary({
      "Proxy Address": proxyInfo.proxy,
      "Implementation": proxyInfo.implementation,
      "Upgrade Pattern": proxyInfo.isUUPS ? "UUPS" : "Transparent",
      "Admin Address": proxyInfo.admin || "N/A (UUPS)",
    });

    // Verify implementation
    console.log("Verifying implementation on block explorer...\n");
    await verifyContract(proxyInfo.implementation, []);

    console.log("\n" + "=".repeat(60));
    console.log("✅ VERIFICATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`View on Snowtrace: ${getSnowtraceUrl(proxyAddress, network.chainId)}\n`);

  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
    process.exit(1);
  }
}

/**
 * Get Snowtrace URL for an address
 */
function getSnowtraceUrl(address, chainId) {
  const baseUrl = chainId === 43114 
    ? "https://snowtrace.io" 
    : "https://testnet.snowtrace.io";
  return `${baseUrl}/address/${address}`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
