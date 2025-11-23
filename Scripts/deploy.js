/**
 * Deployment Script – InvarianceRegistry UUPS Proxy
 * Usage: npx hardhat run --network <network> Scripts/deploy.js
 *
 * Environment:
 *   PRIVATE_KEY – Deployer private key
 *   DRY_RUN – Set to "true" to simulate without deploying
 */

const { ethers } = require("hardhat");
const { deployUpgradeableProxy, logDeploymentSummary } = require("./helpers");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("\n" + "=".repeat(60));
  console.log("🚀 INVARIANCE REGISTRY DEPLOYMENT");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH/AVAX\n`);

  if (process.env.DRY_RUN === "true") {
    console.log("⚠️  DRY_RUN mode – no deployment will occur.\n");
  }

  try {
    if (process.env.DRY_RUN === "true") {
      console.log("✓ Simulation complete (no actual deployment)");
      return;
    }

    // Deploy the UUPS proxy
    const { proxyAddress, implementationAddress, contract } = await deployUpgradeableProxy(
      "InvarianceRegistry",
      [deployer.address],
      { initializer: "initialize" }
    );

    // Verify initialization
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

    if (!hasAdminRole) {
      throw new Error("Deployment verification failed: admin role not assigned");
    }

    // Log summary
    logDeploymentSummary({
      "Network": `${network.name} (${network.chainId})`,
      "Deployer": deployer.address,
      "Proxy Address": proxyAddress,
      "Implementation": implementationAddress,
      "Admin Role": hasAdminRole ? "✓ Assigned" : "✗ Failed",
      "Timestamp": new Date().toISOString(),
    });

    console.log("💾 Save these addresses for future upgrades and verification!");
    console.log(`\nTo verify on Snowtrace, run:`);
    console.log(`PROXY_ADDRESS=${proxyAddress} npm run verify:${network.name === "avalanche" ? "mainnet" : "fuji"}`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

