import hre from "hardhat";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { logSuccess, deployerAddress } from "../util";
import * as readline from "readline";

// Network configuration - token addresses only
const NETWORK_CONFIG = {
  mainnet: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum mainnet
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT on Ethereum mainnet
  },
  arbitrum: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Native USDC on Arbitrum
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT on Arbitrum
  }
};

// Get current network configuration
const getNetworkConfig = () => {
  const networkName = hre.network.name;
  console.log(`🌐 Network: ${networkName}`);
  
  if (networkName === "mainnet" || networkName === "ethereum") {
    return NETWORK_CONFIG.mainnet;
  } else if (networkName === "arbitrum" || networkName === "arbitrumOne") {
    return NETWORK_CONFIG.arbitrum;
  } else {
    throw new Error(`Unsupported network: ${networkName}. Supported networks: arbitrum, mainnet`);
  }
};

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
const confirmTransaction = async (usdcAmount: string, usdtAmount: string, gasPrice: string): Promise<boolean> => {
  console.log(`\n📋 Transaction Summary:`);
  console.log(`  USDC to withdraw: ${usdcAmount} USDC`);
  console.log(`  USDT to withdraw: ${usdtAmount} USDT`);
  console.log(`  Gas Price: ${gasPrice} gwei`);
  console.log(`  Network: ${hre.network.name}`);
  
  const confirmation = await promptUser(`\n❓ Do you want to proceed with this withdrawal? (yes/no): `);
  return confirmation.toLowerCase() === 'yes' || confirmation.toLowerCase() === 'y';
};

export const prodWithdrawUsdcUsdtDexLite = async (
  usdcAmount: string,
  usdtAmount: string,
  gasPriceGwei: string = "0.02" // Default: 0.02 gwei
) => {
  // Get network-specific configuration and deployment addresses
  const config = getNetworkConfig();
  const deploymentAddresses = await getDeploymentAddresses();
  const networkName = hre.network.name;
  
  console.log(`🔄 Withdrawing USDC/USDT from DexLite on ${networkName}`);

  console.log(`📍 Contract Addresses:`);
  console.log(`  FluidDexLite: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`  AdminModule: ${deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS}`);

  const deployer = await deployerAddress(hre);
  console.log("Deployer address:", deployer);

  // Get contract instances
  const dexLite = await ethers.getContractAt("FluidDexLite", deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
  const adminModule = await ethers.getContractAt("FluidDexLiteAdminModule", deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS);

  // Get ERC20 token interfaces to check balances
  const usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDC);
  const usdt = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDT);

  // Create DexKey struct (must match the one used during initialization)
  const dexKey = {
    token0: config.USDC,
    token1: config.USDT,
    salt: ethers.constants.HashZero // Use same salt as initialization
  };

  // Check current pool balances before withdrawal
  const poolUsdcBalance = await usdc.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
  const poolUsdtBalance = await usdt.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);

  console.log(`Pool USDC balance: ${ethers.utils.formatUnits(poolUsdcBalance, 6)} USDC`);
  console.log(`Pool USDT balance: ${ethers.utils.formatUnits(poolUsdtBalance, 6)} USDT`);

  // Check deployer balances before withdrawal
  const deployerUsdcBalanceBefore = await usdc.balanceOf(deployer);
  const deployerUsdtBalanceBefore = await usdt.balanceOf(deployer);

  console.log(`Deployer USDC balance (before): ${ethers.utils.formatUnits(deployerUsdcBalanceBefore, 6)} USDC`);
  console.log(`Deployer USDT balance (before): ${ethers.utils.formatUnits(deployerUsdtBalanceBefore, 6)} USDT`);

  // Parse withdrawal amounts (6 decimals for both USDC and USDT)
  const token0Amount = ethers.utils.parseUnits(usdcAmount, 6);
  const token1Amount = ethers.utils.parseUnits(usdtAmount, 6);

  // Verify sufficient balance in pool (basic check)
  if (poolUsdcBalance.lt(token0Amount)) {
    throw new Error(`Insufficient USDC in pool. Need ${ethers.utils.formatUnits(token0Amount, 6)} USDC, pool has ${ethers.utils.formatUnits(poolUsdcBalance, 6)} USDC`);
  }
  if (poolUsdtBalance.lt(token1Amount)) {
    throw new Error(`Insufficient USDT in pool. Need ${ethers.utils.formatUnits(token1Amount, 6)} USDT, pool has ${ethers.utils.formatUnits(poolUsdtBalance, 6)} USDT`);
  }

  console.log("📋 Withdrawal Parameters:");
  console.log(`  Network: ${networkName}`);
  console.log(`  USDC to withdraw: ${ethers.utils.formatUnits(token0Amount, 6)} USDC`);
  console.log(`  USDT to withdraw: ${ethers.utils.formatUnits(token1Amount, 6)} USDT`);
  console.log(`  Recipient: ${deployer}`);

  // Show final confirmation with all transaction details
  console.log(`\n📋 Final Transaction Summary:`);
  console.log(`  Action: Withdraw from USDC/USDT DexLite Pool`);
  console.log(`  USDC Amount: ${usdcAmount} USDC`);
  console.log(`  USDT Amount: ${usdtAmount} USDT`);
  console.log(`  Gas Price: ${gasPriceGwei} gwei`);
  console.log(`  Network: ${networkName}`);
  console.log(`  Contract: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  
  const finalConfirmation = await confirmTransaction(usdcAmount, usdtAmount, gasPriceGwei);
  if (!finalConfirmation) {
    console.log("❌ Transaction cancelled by user.");
    return;
  }

  // Encode the withdraw function call
  const withdrawData = adminModule.interface.encodeFunctionData("withdraw", [
    dexKey,
    token0Amount,
    token1Amount,
    deployer // Send tokens to deployer address
  ]);

  // Encode the fallback data (target address + spell data)
  const fallbackData = ethers.utils.defaultAbiCoder.encode(
    ["address", "bytes"],
    [deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS, withdrawData]
  );

  const gasPrice = ethers.utils.parseUnits(gasPriceGwei, "gwei");
  const estimatedGasCost = gasPrice.mul(500000); // gasLimit * gasPrice

  console.log("🔄 Executing withdrawal from USDC/USDT DEX...");
  console.log(`💰 Using gas price: ${gasPriceGwei} gwei`);
  console.log(`💸 Estimated transaction cost: ${ethers.utils.formatEther(estimatedGasCost)} ETH`);

  try {
    // Call the fallback function to delegate call withdraw
    const withdrawTx = await dexLite.signer.sendTransaction({
      to: deploymentAddresses.FLUID_DEX_LITE_ADDRESS,
      data: fallbackData,
      gasLimit: 500000,
      gasPrice: gasPrice
    });
    const receipt = await withdrawTx.wait();

    const actualGasCost = receipt.gasUsed.mul(gasPrice);

    logSuccess("✅ USDC/USDT withdrawal completed successfully!");
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()} (limit: 500,000)`);
    console.log(`Actual transaction cost: ${ethers.utils.formatEther(actualGasCost)} ETH (at ${gasPriceGwei} gwei)`);

    // Check balances after withdrawal
    const deployerUsdcBalanceAfter = await usdc.balanceOf(deployer);
    const deployerUsdtBalanceAfter = await usdt.balanceOf(deployer);
    const poolUsdcBalanceAfter = await usdc.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
    const poolUsdtBalanceAfter = await usdt.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);

    console.log("\n📊 Withdrawal Results:");
    console.log(`  Deployer USDC balance (after): ${ethers.utils.formatUnits(deployerUsdcBalanceAfter, 6)} USDC`);
    console.log(`  Deployer USDT balance (after): ${ethers.utils.formatUnits(deployerUsdtBalanceAfter, 6)} USDT`);
    console.log(`  Pool USDC balance (after): ${ethers.utils.formatUnits(poolUsdcBalanceAfter, 6)} USDC`);
    console.log(`  Pool USDT balance (after): ${ethers.utils.formatUnits(poolUsdtBalanceAfter, 6)} USDT`);

    console.log("\n💰 Amount Withdrawn:");
    console.log(`  USDC: ${ethers.utils.formatUnits(deployerUsdcBalanceAfter.sub(deployerUsdcBalanceBefore), 6)} USDC`);
    console.log(`  USDT: ${ethers.utils.formatUnits(deployerUsdtBalanceAfter.sub(deployerUsdtBalanceBefore), 6)} USDT`);

    console.log("\n📈 Pool Configuration:");
    console.log(`  Network: ${networkName}`);
    console.log(`  Token Pair: USDC/USDT`);
    console.log(`  USDC Address: ${config.USDC}`);
    console.log(`  USDT Address: ${config.USDT}`);
    console.log(`  DexLite Contract: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);

    return receipt.transactionHash;

  } catch (error: any) {
    console.error("❌ Withdrawal failed:");

    // Enhanced error handling with common scenarios
    if (error.message.includes("revert")) {
      console.error("Transaction reverted. Possible reasons:");
      console.error("  • Insufficient liquidity in the pool");
      console.error("  • DEX not properly initialized");
      console.error("  • Unauthorized caller (deployer not authorized)");
      console.error("  • Arithmetic underflow (trying to withdraw more than available)");
    } else if (error.message.includes("gas")) {
      console.error("Gas estimation failed. Try increasing gas limit.");
    } else if (error.message.includes("nonce")) {
      console.error("Nonce issue. Check if another transaction is pending.");
    }

    console.error("Full error:", error.message);
    throw error;
  }
};

// Main execution function with interactive input
const main = async () => {
  console.log(`💸 USDC/USDT DexLite Withdrawal Script`);
  console.log(`Network: ${hre.network.name}\n`);

  // Prompt for withdrawal amounts
  const usdcAmount = await promptUser(`💵 Enter USDC amount to withdraw: `);
  const usdtAmount = await promptUser(`💵 Enter USDT amount to withdraw: `);
  const gasPriceGwei = await promptUser(`⛽ Enter gas price in gwei (e.g., 0.02, 1, 5): `);

  // Validate inputs
  if (!usdcAmount || isNaN(Number(usdcAmount)) || Number(usdcAmount) <= 0) {
    throw new Error("❌ Invalid USDC amount. Please enter a positive number.");
  }
  if (!usdtAmount || isNaN(Number(usdtAmount)) || Number(usdtAmount) <= 0) {
    throw new Error("❌ Invalid USDT amount. Please enter a positive number.");
  }
  if (!gasPriceGwei || isNaN(Number(gasPriceGwei)) || Number(gasPriceGwei) <= 0) {
    throw new Error("❌ Invalid gas price. Please enter a positive number.");
  }

  // Confirm transaction
  const confirmed = await confirmTransaction(usdcAmount, usdtAmount, gasPriceGwei);
  if (!confirmed) {
    console.log("❌ Transaction cancelled by user.");
    return;
  }

  // Execute withdrawal
  await prodWithdrawUsdcUsdtDexLite(usdcAmount, usdtAmount, gasPriceGwei);
};

// Allow running directly
if (require.main === module) {
  main().catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
  });
} 