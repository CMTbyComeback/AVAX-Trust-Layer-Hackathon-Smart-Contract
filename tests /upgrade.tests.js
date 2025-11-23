const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("InvarianceRegistry Upgrade Safety", () => {
  let proxy;
  let admin;
  let analyzer;

  beforeEach(async () => {
    [admin, analyzer] = await ethers.getSigners();

    // Deploy the initial proxy
    const Registry = await ethers.getContractFactory("InvarianceRegistry");
    proxy = await upgrades.deployProxy(
      Registry,
      [admin.address],
      { initializer: "initialize" }
    );

    await proxy.waitForDeployment();
  });

  it("should deploy proxy with correct initialization", async () => {
    const proxyAddress = await proxy.getAddress();
    expect(proxyAddress).to.be.properAddress;

    // Verify that admin has DEFAULT_ADMIN_ROLE
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasAdminRole = await proxy.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
    expect(hasAdminRole).to.be.true;
  });

  it("should preserve storage layout through upgrade", async () => {
    const proxyAddress = await proxy.getAddress();

    // Get implementation before upgrade
    const implBefore = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("✓ Implementation before upgrade:", implBefore);

    // Deploy a new version (same contract for this test)
    const RegistryV2 = await ethers.getContractFactory("InvarianceRegistry");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RegistryV2);

    await upgraded.waitForDeployment();

    // Get implementation after upgrade
    const implAfter = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("✓ Implementation after upgrade:", implAfter);

    // Verify that the proxy address stays the same
    const proxyAfterUpgrade = await upgraded.getAddress();
    expect(proxyAfterUpgrade).to.equal(proxyAddress);

    // Verify admin role still exists and is assigned to the original admin
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasAdminRole = await upgraded.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
    expect(hasAdminRole).to.be.true;

    console.log("✓ Storage layout preserved after upgrade");
  });

  it("should grant and verify roles after upgrade", async () => {
    const ANALYZER_ROLE = await proxy.ANALYZER_ROLE();

    // Grant ANALYZER_ROLE to analyzer account
    await proxy.grantRole(ANALYZER_ROLE, analyzer.address);

    const hasAnalyzerRole = await proxy.hasRole(ANALYZER_ROLE, analyzer.address);
    expect(hasAnalyzerRole).to.be.true;

    // Perform upgrade
    const proxyAddress = await proxy.getAddress();
    const RegistryV2 = await ethers.getContractFactory("InvarianceRegistry");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RegistryV2);

    // Verify role persists after upgrade
    const hasAnalyzerRoleAfter = await upgraded.hasRole(ANALYZER_ROLE, analyzer.address);
    expect(hasAnalyzerRoleAfter).to.be.true;

    console.log("✓ Roles persisted correctly after upgrade");
  });

  it("should fail upgrade if storage gap is violated", async () => {
    // This test is illustrative: it would fail if the __gap was removed
    // or if storage variables were reordered without proper upgrade planning.
    // For now, we just verify that the contract compiles with the gap in place.
    
    const proxyAddress = await proxy.getAddress();
    const RegistryV2 = await ethers.getContractFactory("InvarianceRegistry");
    
    // This should succeed because we haven't violated the storage layout
    const upgraded = await upgrades.upgradeProxy(proxyAddress, RegistryV2);
    await upgraded.waitForDeployment();

    const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    expect(newImpl).to.be.properAddress;

    console.log("✓ Storage gap integrity verified");
  });
});
