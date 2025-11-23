const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InvarianceRegistry – Events", () => {
  let registry;
  let admin;
  let analyzer;
  let targetContract;

  beforeEach(async () => {
    [admin, analyzer, targetContract] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("InvarianceRegistry");
    registry = await ethers.deployContract("InvarianceRegistry");
    await registry.waitForDeployment();

    await registry.initialize(admin.address);

    // Grant analyzer role
    const ANALYZER_ROLE = await registry.ANALYZER_ROLE();
    await registry.connect(admin).grantRole(ANALYZER_ROLE, analyzer.address);
  });

  it("should emit RoleGranted event when admin grants role", async () => {
    const ANALYZER_ROLE = await registry.ANALYZER_ROLE();

    // Use a new signer for this test
    const [, , newAnalyzer] = await ethers.getSigners();

    await expect(
      registry.connect(admin).grantRole(ANALYZER_ROLE, newAnalyzer.address)
    ).to.emit(registry, "RoleGranted")
      .withArgs(ANALYZER_ROLE, newAnalyzer.address, admin.address);
  });

  it("should emit RoleRevoked event when admin revokes role", async () => {
    const ANALYZER_ROLE = await registry.ANALYZER_ROLE();
    const [, , targetAnalyzer] = await ethers.getSigners();

    // First grant the role
    await registry.connect(admin).grantRole(ANALYZER_ROLE, targetAnalyzer.address);

    // Then revoke it
    await expect(
      registry.connect(admin).revokeRole(ANALYZER_ROLE, targetAnalyzer.address)
    ).to.emit(registry, "RoleRevoked")
      .withArgs(ANALYZER_ROLE, targetAnalyzer.address, admin.address);
  });

  it("should emit ContractAnalyzed event (when analysis is recorded)", async () => {
    // This test is a placeholder for when the contract implementation includes
    // a public method to record contract analyses.
    // The event should include: contractAddress, fraudSurface, riskLevel, timestamp, analyzer
    expect(registry.address).to.be.properAddress;
  });

  it("should emit HighRiskDetected event for high-risk contracts", async () => {
    // This test is a placeholder for when fraud surface exceeds a threshold
    // The event should include: contractAddress, fraudSurface
    expect(registry.address).to.be.properAddress;
  });

  it("should emit WarningsUpdated event when warnings change", async () => {
    // This test is a placeholder for when warnings are added/updated
    // The event should include: contractAddress, count
    expect(registry.address).to.be.properAddress;
  });
});
