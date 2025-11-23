import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying with:", deployer.address);

  const Registry = await ethers.getContractFactory("InvarianceRegistry");

  const proxy = await upgrades.deployProxy(
    Registry,
    [deployer.address],   // initializer param
    { initializer: "initialize" }
  );

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implAddress  = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("🎉 Deployment Complete!");
  console.log(`🔗 Proxy Address: ${proxyAddress}`);
  console.log(`🧱 Implementation: ${implAddress}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
