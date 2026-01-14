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

const X24 = 0xffffffn;

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
const confirmTransaction = async (gasPriceGwei: string): Promise<boolean> => {
  console.log(`\n📋 Final Transaction Summary:`);
  console.log(`  Action: Initialize USDC/USDT DexLite Pool`);
  console.log(`  Initial Liquidity: 100 USDC + 100 USDT`);
  console.log(`  Fee Tier: 0.0005%`);
  console.log(`  Price Range: ±0.15%`);
  console.log(`  Gas Price: ${gasPriceGwei} gwei`);
  console.log(`  Network: ${hre.network.name}`);
  
  const confirmation = await promptUser(`\n❓ Do you want to proceed with pool initialization? (yes/no): `);
  return confirmation.toLowerCase() === 'yes' || confirmation.toLowerCase() === 'y';
};

export const prodInitializeUsdcUsdtDexLite = async (
  gasPriceGwei: string = "0.02" // Default: 0.02 gwei
) => {
  // Get network-specific configuration and deployment addresses
  const config = getNetworkConfig();
  const deploymentAddresses = await getDeploymentAddresses();
  const networkName = hre.network.name;
  
  console.log(`🚀 Initializing USDC/USDT DexLite on ${networkName}`);
  console.log("Target Range: ±0.15%");
  console.log("Initial Deposits: 100 USDC + 100 USDT");

  console.log(`📍 Contract Addresses:`);
  console.log(`  FluidDexLite: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`  AdminModule: ${deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS}`);

  const deployer = await deployerAddress(hre);
  console.log("Deployer address:", deployer);

  // Get contract instances
  const dexLite = await ethers.getContractAt("FluidDexLite", deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
  const adminModule = await ethers.getContractAt("FluidDexLiteAdminModule", deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS);

  // Get ERC20 token interfaces
  const usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDC);
  const usdt = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDT);

  // Check deployer balances
  const usdcBalance = await usdc.balanceOf(deployer);
  const usdtBalance = await usdt.balanceOf(deployer);
  
  console.log(`Deployer USDC balance: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`Deployer USDT balance: ${ethers.utils.formatUnits(usdtBalance, 6)} USDT`);

  // Amounts to deposit (100 tokens each, considering 6 decimals)
  const token0Amount = ethers.utils.parseUnits("100", 6); // 100 USDC
  const token1Amount = ethers.utils.parseUnits("100", 6); // 100 USDT

  // Verify sufficient balance
  if (usdcBalance.lt(token0Amount)) {
    throw new Error(`Insufficient USDC balance. Need 100 USDC, have ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  }
  if (usdtBalance.lt(token1Amount)) {
    throw new Error(`Insufficient USDT balance. Need 100 USDT, have ${ethers.utils.formatUnits(usdtBalance, 6)} USDT`);
  }

  // Create DexKey struct
  const dexKey = {
    token0: config.USDC,
    token1: config.USDT,
    salt: ethers.constants.HashZero // Use zero salt for simplicity
  };

  // Initialize parameters for USDC/USDT with ±0.15% range
  const initParams = {
    dexKey: dexKey,
    fee: 5, // 0.0005% fee (5 = 0.0005% in 4 decimals) - very low fee for stablecoin pair
    revenueCut: 0, // No revenue cut
    rebalancingStatus: false,
    centerPrice: ethers.utils.parseUnits("1", 27), // 1:1 center price (1 USDC = 1 USDT)
    centerPriceContract: 0, // No external price contract
    upperPercent: 1500, // 0.15% upper range (1500 = 0.15% in 4 decimals)
    lowerPercent: 1500, // 0.15% lower range (1500 = 0.15% in 4 decimals)
    upperShiftThreshold: 0, // 1% threshold (10000 = 1% in 4 decimals)
    lowerShiftThreshold: 0, // 1% threshold (10000 = 1% in 4 decimals)
    shiftTime: X24, // max shift time
    minCenterPrice: ethers.utils.parseUnits("0.9995", 27),
    maxCenterPrice: ethers.utils.parseUnits("1.0005", 27),
    token0Amount: token0Amount, // Include token amounts in the struct
    token1Amount: token1Amount
  };

  console.log("📋 Initialize Parameters:");
  console.log(`  Fee: ${initParams.fee / 10000}%`);
  console.log(`  Range: ±${initParams.upperPercent / 10000}%`);
  console.log(`  Center Price: 1:1 (USDC:USDT)`);
  console.log(`  Shift Threshold: ±${initParams.upperShiftThreshold / 10000}%`);

  // Parse gas price
  const gasPrice = ethers.utils.parseUnits(gasPriceGwei, "gwei");

  // Approve tokens for DexLite contract
  console.log("✅ Approving tokens...");
  
  // const approveTx1 = await usdc.approve(deploymentAddresses.FLUID_DEX_LITE_ADDRESS, token0Amount, {
  //   gasPrice: gasPrice
  // });
  // await approveTx1.wait();
  // console.log(`Approved ${ethers.utils.formatUnits(token0Amount, 6)} USDC`);

  // const approveTx2 = await usdt.approve(deploymentAddresses.FLUID_DEX_LITE_ADDRESS, token1Amount, {
  //   gasPrice: gasPrice
  // });
  // await approveTx2.wait();
  // console.log(`Approved ${ethers.utils.formatUnits(token1Amount, 6)} USDT`);

  // Encode the initialize function call
  const initializeData = adminModule.interface.encodeFunctionData("initialize", [
    initParams
  ]);

  // Encode the fallback data (target address + spell data)
  const fallbackData = ethers.utils.defaultAbiCoder.encode(
    ["address", "bytes"],
    [deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS, initializeData]
  );

  const estimatedGasCost = gasPrice.mul(1000000); // gasLimit * gasPrice

  console.log("🔄 Initializing USDC/USDT DEX...");
  console.log(`💰 Using gas price: ${gasPriceGwei} gwei`);
  console.log(`💸 Estimated transaction cost: ${ethers.utils.formatEther(estimatedGasCost)} ETH`);

  // Call the fallback function to delegate call initialize
  const initTx = await dexLite.signer.sendTransaction({
    to: deploymentAddresses.FLUID_DEX_LITE_ADDRESS,
    data: fallbackData,
    gasLimit: 1000000,
    gasPrice: gasPrice
  });
  const receipt = await initTx.wait();

  const actualGasCost = receipt.gasUsed.mul(gasPrice);

  logSuccess("✅ USDC/USDT DexLite initialized successfully!");
  console.log(`Transaction hash: ${receipt.transactionHash}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()} (limit: 1,000,000)`);
  console.log(`Actual transaction cost: ${ethers.utils.formatEther(actualGasCost)} ETH (at ${gasPriceGwei} gwei)`);
  
  console.log("\n📊 DEX Configuration:");
  console.log(`  Network: ${networkName}`);
  console.log(`  Token Pair: USDC/USDT`);
  console.log(`  USDC Address: ${config.USDC}`);
  console.log(`  USDT Address: ${config.USDT}`);
  console.log(`  Initial Liquidity: 100 USDC + 100 USDT`);
  console.log(`  Fee Tier: 0.0005%`);
  console.log(`  Price Range: ±0.15%`);
  console.log(`  DexLite Contract: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  
  return receipt.transactionHash;
};

// Main execution function with interactive input
const main = async () => {
  console.log(`🚀 USDC/USDT DexLite Pool Initialization Script`);
  console.log(`Network: ${hre.network.name}\n`);

  // Prompt for gas price
  const gasPriceGwei = await promptUser(`⛽ Enter gas price in gwei (e.g., 0.02, 1, 5): `);

  // Validate gas price
  if (!gasPriceGwei || isNaN(Number(gasPriceGwei)) || Number(gasPriceGwei) <= 0) {
    throw new Error("❌ Invalid gas price. Please enter a positive number.");
  }

  // Confirm transaction
  const confirmed = await confirmTransaction(gasPriceGwei);
  if (!confirmed) {
    console.log("❌ Transaction cancelled by user.");
    return;
  }

  // Execute initialization
  await prodInitializeUsdcUsdtDexLite(gasPriceGwei);
};

// Allow running directly
if (require.main === module) {
  main().catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
  });
} 