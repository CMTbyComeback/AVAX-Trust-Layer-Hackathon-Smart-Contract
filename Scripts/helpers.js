/**
 * Deployment and Utility Helpers
 * Shared functions for consistent deployment and upgrade workflows
 */

const { ethers, upgrades } = require("hardhat");

/**
 * Deploy an upgradeable proxy with the UUPS pattern
 * @param {string} contractName - Name of the contract factory (e.g., "InvarianceRegistry")
 * @param {array} initArgs - Initializer arguments
 * @param {object} opts - Options (e.g., { initializer: "initialize" })
 * @returns {object} { proxyAddress, implementationAddress, contract }
 */
async function deployUpgradeableProxy(contractName, initArgs = [], opts = {}) {
  const defaultOpts = {
    initializer: "initialize",
    kind: "uups",
  };
  const options = { ...defaultOpts, ...opts };

  console.log(`\n📦 Deploying ${contractName} (UUPS)...`);

  const ContractFactory = await ethers.getContractFactory(contractName);
  const proxy = await upgrades.deployProxy(ContractFactory, initArgs, options);

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log(`✅ Deployment successful!`);
  console.log(`   Proxy Address: ${proxyAddress}`);
  console.log(`   Implementation: ${implementationAddress}`);

  return {
    proxyAddress,
    implementationAddress,
    contract: proxy,
  };
}

/**
 * Upgrade an existing UUPS proxy to a new implementation
 * @param {string} proxyAddress - Address of the proxy
 * @param {string} newContractName - Name of the new contract factory
 * @param {object} opts - Options
 * @returns {object} { proxyAddress, newImplementationAddress, contract }
 */
async function upgradeProxy(proxyAddress, newContractName, opts = {}) {
  if (!proxyAddress || !ethers.isAddress(proxyAddress)) {
    throw new Error(`❌ Invalid proxy address: ${proxyAddress}`);
  }

  console.log(`\n🔄 Upgrading proxy at ${proxyAddress}...`);

  const implBefore = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log(`   Current implementation: ${implBefore}`);

  const NewContractFactory = await ethers.getContractFactory(newContractName);
  const upgraded = await upgrades.upgradeProxy(proxyAddress, NewContractFactory, opts);

  await upgraded.waitForDeployment();

  const implAfter = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log(`✅ Upgrade successful!`);
  console.log(`   Proxy Address: ${proxyAddress}`);
  console.log(`   New Implementation: ${implAfter}`);
  console.log(`   Changed: ${implBefore !== implAfter}`);

  return {
    proxyAddress,
    newImplementationAddress: implAfter,
    contract: upgraded,
  };
}

/**
 * Verify a contract on Etherscan/Snowtrace
 * @param {string} implementationAddress - Address to verify
 * @param {object} constructorArguments - Constructor args (default [])
 * @returns {void}
 */
async function verifyContract(implementationAddress, constructorArguments = []) {
  if (!implementationAddress || !ethers.isAddress(implementationAddress)) {
    throw new Error(`❌ Invalid implementation address: ${implementationAddress}`);
  }

  console.log(`\n🔍 Verifying ${implementationAddress}...`);

  try {
    const { run } = require("hardhat");
    await run("verify:verify", {
      address: implementationAddress,
      constructorArguments,
    });
    console.log(`✅ Verification successful!`);
  } catch (error) {
    if (error.message.includes("Contract source code already verified")) {
      console.log(`ℹ️  Contract already verified.`);
    } else {
      console.error(`❌ Verification failed:`, error.message);
      throw error;
    }
  }
}

/**
 * Get deployment info for a proxy
 * @param {string} proxyAddress - Address of the proxy
 * @returns {object} { proxy, implementation, admin, isUUPS }
 */
async function getProxyInfo(proxyAddress) {
  if (!proxyAddress || !ethers.isAddress(proxyAddress)) {
    throw new Error(`❌ Invalid proxy address: ${proxyAddress}`);
  }

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress).catch(() => null);

  return {
    proxy: proxyAddress,
    implementation: implementationAddress,
    admin: adminAddress,
    isUUPS: !!implementationAddress && !adminAddress,
  };
}

/**
 * Validate that a contract can be upgraded safely
 * @param {string} contractName - Name of the current contract
 * @param {string} newContractName - Name of the new contract
 * @returns {object} { isCompatible, issues }
 */
async function validateUpgrade(contractName, newContractName) {
  console.log(`\n✓ Running upgrade validation...`);

  try {
    const CurrentContract = await ethers.getContractFactory(contractName);
    const NewContract = await ethers.getContractFactory(newContractName);

    // This performs OpenZeppelin's storage layout checks
    await upgrades.validateImplementation(NewContract);

    console.log(`✅ Upgrade validation passed!`);
    return { isCompatible: true, issues: [] };
  } catch (error) {
    console.error(`❌ Upgrade validation failed:`, error.message);
    return { isCompatible: false, issues: [error.message] };
  }
}

/**
 * Wait for a transaction to confirm
 * @param {object} tx - Transaction object
 * @param {number} confirmations - Number of confirmations (default 1)
 * @returns {object} Transaction receipt
 */
async function waitForConfirmation(tx, confirmations = 1) {
  if (!tx || !tx.wait) {
    throw new Error("Invalid transaction object");
  }

  console.log(`⏳ Waiting for ${confirmations} confirmation(s)...`);
  const receipt = await tx.wait(confirmations);
  console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

/**
 * Log deployment summary
 */
function logDeploymentSummary(deploymentInfo) {
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));

  Object.entries(deploymentInfo).forEach(([key, value]) => {
    console.log(`${key.padEnd(25)}: ${value}`);
  });

  console.log("=".repeat(60) + "\n");
}

module.exports = {
  deployUpgradeableProxy,
  upgradeProxy,
  verifyContract,
  getProxyInfo,
  validateUpgrade,
  waitForConfirmation,
  logDeploymentSummary,
};
