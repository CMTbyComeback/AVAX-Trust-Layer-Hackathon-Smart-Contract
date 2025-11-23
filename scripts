// scripts/deploy.js
// Run with: npx hardhat run scripts/deploy.js --network fuji

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying InvarianceRegistry with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "AVAX");

  // Contract factory
  const Registry = await ethers.getContractFactory("InvarianceRegistry");

  console.log("\nDeploying proxy + implementation...");

  // Deploy UUPS proxy
  const registry = await upgrades.deployProxy(
    Registry,
    [deployer.address, deployer.address], // initialAdmin, initialSigner
    {
      kind: "uups",
      initializer: "initialize",
    }
  );

  await registry.waitForDeployment();

  const proxyAddress = await registry.getAddress();
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

  console.log("SUCCESS! InvarianceRegistry deployed");
  console.log("=".repeat(60));
  console.log("Proxy (use this):      ", proxyAddress);
  console.log("Implementation:        ", implAddress);
  console.log("Proxy Admin:           ", adminAddress);
  console.log("Deployer / Admin:      ", deployer.address);
  console.log("Network:               ", network.name);
  console.log("Chain ID:              ", await ethers.provider.getNetwork().then(n => n.chainId));
  console.log("=".repeat(60));

  // Save deployment info
  const deployment = {
    network: network.name,
    chainId: await ethers.provider.getNetwork().then(n => n.chainId),
    proxyAddress,
    implementationAddress: implAddress,
    proxyAdminAddress: adminAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: registry.deploymentTransaction()?.hash,
  };

  const outputPath = path.join(__dirname, "../deployments", `${network.name}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));

  console.log(`\nDeployment info saved to: ${outputPath}`);

  // Auto-verify implementation on Snowtrace (Fuji & Mainnet)
  if (network.name === "fuji" || network.name === "avalanche") {
    console.log("\nVerifying implementation on Snowtrace...");
    try {
      await hre.run("verify:verify", {
        address: implAddress,
        constructorArguments: [],
      });
      console.log("Verification submitted!");
    } catch (e) {
      if (e.message.includes("Already Verified")) {
        console.log("Already verified!");
      } else {
        console.log("Verification failed (will be available soon):", e.message);
      }
    }
  }

  // Print next steps
  console.log("\nNEXT STEPS:");
  console.log("1. Update subgraph.yaml with proxy address");
  console.log("2. Deploy subgraph: cd subgraph && npm run deploy-fuji");
  console.log("3. Set SIGNER_ROLE to your scanner wallet");
  console.log("4. Profit");

  console.log("\nSnowtrace Links:");
  console.log(`https://testnet.snowtrace.io/address/${proxyAddress} (Fuji)`);
  if (network.name === "avalanche") {
    console.log(`https://snowtrace.io/address/${proxyAddress} (Mainnet)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
