import { ethers, upgrades } from "hardhat";

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) {
    throw new Error("❌ PROXY_ADDRESS not set in environment.");
  }

  console.log(`\n🔁 Starting upgrade for proxy at ${proxyAddress}...\n`);

  // Load the new implementation
  const RegistryV2 = await ethers.getContractFactory("InvarianceRegistry");

  // Perform upgrade (UUPS)
  const upgraded = await upgrades.upgradeProxy(proxyAddress, RegistryV2);

  await upgraded.waitForDeployment();

  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("✅ Upgrade successful!");
  console.log(`🔗 Proxy Address: ${proxyAddress}`);
  console.log(`🧱 New Implementation Address: ${implAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
