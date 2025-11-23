import { ethers, run } from "hardhat";
import { erc1967 } from "@openzeppelin/upgrades-core";

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) {
    throw new Error("❌ PROXY_ADDRESS not set in environment.");
  }

  console.log(`\n🔍 Verifying implementation behind proxy ${proxyAddress}...\n`);

  const implementationAddress = await erc1967.getImplementationAddress(
    ethers.provider,
    proxyAddress
  );

  console.log(`📌 Implementation Address Found: ${implementationAddress}`);

  try {
    await run("verify:verify", {
      address: implementationAddress,
      constructorArguments: [],
    });

    console.log("🎉 Verification successful!");
  } catch (e: any) {
    if (e.message.includes("Contract source code already verified")) {
      console.log("ℹ Already verified.");
    } else {
      console.error("❌ Verification failed:", e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
