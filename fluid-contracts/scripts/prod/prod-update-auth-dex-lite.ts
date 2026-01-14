import hre from "hardhat";
import { ethers } from "hardhat";
import { logSuccess, deployerAddress } from "../util";
import * as readline from "readline";

// Get deployment addresses from hre.deployments
const getDeploymentAddresses = async () => {
  try {
    const fluidDexLite = await hre.deployments.get("FluidDexLite");
    const fluidDexLiteAdminModule = await hre.deployments.get("FluidDexLiteAdminModule");
    
    return {
      FLUID_DEX_LITE_ADDRESS: fluidDexLite.address,
      FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS: fluidDexLiteAdminModule.address
    };
  } catch (error) {
    throw new Error(`Failed to get deployment addresses. Make sure contracts are deployed on ${hre.network.name}: ${error}`);
  }
};

// Helper function to prompt user input
const promptUser = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

// Helper function to confirm transaction details
const confirmTransaction = async (authAddress: string, authStatus: boolean, gasPrice: string): Promise<boolean> => {
  console.log(`\n📋 Transaction Summary:`);
  console.log(`  Auth Address: ${authAddress}`);
  console.log(`  Action: ${authStatus ? 'AUTHORIZE' : 'REVOKE'} access`);
  console.log(`  Gas Price: ${gasPrice} gwei`);
  console.log(`  Network: ${hre.network.name}`);
  
  const confirmation = await promptUser(`\n❓ Do you want to proceed with this auth update? (yes/no): `);
  return confirmation.toLowerCase() === 'yes' || confirmation.toLowerCase() === 'y';
};

export const prodUpdateAuthDexLite = async (
  authAddress: string,
  authStatus: boolean,
  gasPriceGwei: string = "0.02" // Default: 0.02 gwei
) => {
  // Get deployment addresses
  const deploymentAddresses = await getDeploymentAddresses();
  const networkName = hre.network.name;
  
  console.log(`🔑 Updating Auth for DexLite on ${networkName}`);

  console.log(`📍 Contract Addresses:`);
  console.log(`  FluidDexLite: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`  AdminModule: ${deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS}`);

  // Validate auth address
  if (!ethers.utils.isAddress(authAddress)) {
    throw new Error(`❌ Invalid auth address: ${authAddress}`);
  }

  const deployer = await deployerAddress(hre);
  console.log("Deployer address:", deployer);

  // Get contract instances
  const dexLite = await ethers.getContractAt("FluidDexLite", deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
  const adminModule = await ethers.getContractAt("FluidDexLiteAdminModule", deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS);

  console.log("\n📋 Auth Update Parameters:");
  console.log(`  Network: ${networkName}`);
  console.log(`  Auth Address: ${authAddress}`);
  console.log(`  Auth Status: ${authStatus ? "AUTHORIZED" : "REVOKED"}`);
  console.log(`  Executor: ${deployer}`);

  // Transaction details already confirmed in main function

  // Encode the updateAuth function call
  const updateAuthData = adminModule.interface.encodeFunctionData("updateAuth", [
    authAddress,
    authStatus
  ]);

  // Encode the fallback data (target address + spell data)
  const fallbackData = ethers.utils.defaultAbiCoder.encode(
    ["address", "bytes"],
    [deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS, updateAuthData]
  );

  const gasPrice = ethers.utils.parseUnits(gasPriceGwei, "gwei");
  const estimatedGasCost = gasPrice.mul(300000); // gasLimit * gasPrice

  console.log("\n🔄 Executing auth update...");
  console.log(`💰 Using gas price: ${gasPriceGwei} gwei`);
  console.log(`💸 Estimated transaction cost: ${ethers.utils.formatEther(estimatedGasCost)} ETH`);

  try {
    // Call the fallback function to delegate call updateAuth
    const updateAuthTx = await dexLite.signer.sendTransaction({
      to: deploymentAddresses.FLUID_DEX_LITE_ADDRESS,
      data: fallbackData,
      gasLimit: 300000,
      gasPrice: gasPrice
    });
    const receipt = await updateAuthTx.wait();

    const actualGasCost = receipt.gasUsed.mul(gasPrice);

    logSuccess("✅ Auth update completed successfully!");
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()} (limit: 300,000)`);
    console.log(`Actual transaction cost: ${ethers.utils.formatEther(actualGasCost)} ETH (at ${gasPriceGwei} gwei)`);

    console.log("\n📊 Auth Update Results:");
    console.log(`  Network: ${networkName}`);
    console.log(`  Address: ${authAddress}`);
    console.log(`  Status: ${authStatus ? "✅ AUTHORIZED" : "❌ REVOKED"}`);
    console.log(`  Updated by: ${deployer}`);

    console.log("\n📈 Contract Configuration:");
    console.log(`  Network: ${networkName}`);
    console.log(`  DexLite Contract: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
    console.log(`  Admin Module: ${deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS}`);

    return receipt.transactionHash;

  } catch (error: any) {
    console.error("❌ Auth update failed:");

    // Enhanced error handling with common scenarios
    if (error.message.includes("revert")) {
      console.error("Transaction reverted. Possible reasons:");
      console.error("  • Caller not authorized to update auth");
      console.error("  • Invalid auth address");
      console.error("  • Contract not properly initialized");
      console.error("  • Admin module not properly configured");
    } else if (error.message.includes("gas")) {
      console.error("Gas estimation failed. Try increasing gas limit.");
    } else if (error.message.includes("nonce")) {
      console.error("Nonce issue. Check if another transaction is pending.");
    }

    console.error("Full error:", error.message);
    throw error;
  }
};

// Wrapper functions for common auth operations
export const prodGrantAuthDexLite = async (authAddress: string, gasPriceGwei: string = "0.02") => {
  return prodUpdateAuthDexLite(authAddress, true, gasPriceGwei);
};

export const prodRevokeAuthDexLite = async (authAddress: string, gasPriceGwei: string = "0.02") => {
  return prodUpdateAuthDexLite(authAddress, false, gasPriceGwei);
};

// Main execution function with interactive input
const main = async () => {
  console.log(`🔐 DexLite Auth Management Script`);
  console.log(`Network: ${hre.network.name}\n`);

  // Prompt for auth address
  const authAddress = await promptUser(`📋 Enter the address to authorize/revoke: `);

  // Validate address
  if (!ethers.utils.isAddress(authAddress)) {
    throw new Error(`❌ Invalid address: ${authAddress}`);
  }

  // Prompt for auth action
  console.log(`\n🔑 Auth Action Options:`);
  console.log(`  1. AUTHORIZE (grant access)`);
  console.log(`  2. REVOKE (remove access)`);
  const actionChoice = await promptUser(`Choose action (1 or 2): `);

  let authStatus: boolean;
  if (actionChoice === '1') {
    authStatus = true;
  } else if (actionChoice === '2') {
    authStatus = false;
  } else {
    throw new Error("❌ Invalid action choice. Please enter 1 or 2.");
  }

  // Prompt for gas price
  const gasPriceGwei = await promptUser(`⛽ Enter gas price in gwei (e.g., 0.02, 1, 5): `);

  // Validate gas price
  if (!gasPriceGwei || isNaN(Number(gasPriceGwei)) || Number(gasPriceGwei) <= 0) {
    throw new Error("❌ Invalid gas price. Please enter a positive number.");
  }

  // Confirm transaction
  const confirmed = await confirmTransaction(authAddress, authStatus, gasPriceGwei);
  if (!confirmed) {
    console.log("❌ Transaction cancelled by user.");
    return;
  }

  // Execute auth update
  await prodUpdateAuthDexLite(authAddress, authStatus, gasPriceGwei);
};

// Allow running directly with interactive input
if (require.main === module) {
  main().catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
  });
}