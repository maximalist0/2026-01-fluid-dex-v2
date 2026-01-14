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
    const fluidDexLiteResolver = await hre.deployments.get("FluidDexLiteResolver");
    
    return {
      FLUID_DEX_LITE_ADDRESS: fluidDexLite.address,
      FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS: fluidDexLiteAdminModule.address,
      FLUID_DEX_LITE_RESOLVER_ADDRESS: fluidDexLiteResolver.address
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

// Helper function to fetch current price from resolver and pool balances
const fetchCurrentPriceFromResolver = async (deploymentAddresses: any, config: any) => {
  try {
    const resolver = await ethers.getContractAt("FluidDexLiteResolver", deploymentAddresses.FLUID_DEX_LITE_RESOLVER_ADDRESS);
    const dexKey = { token0: config.USDC, token1: config.USDT, salt: ethers.constants.HashZero };
    
    console.log(`\n🔍 Fetching current pool price from resolver...`);
    
    const result = await resolver.callStatic.getPricesAndReserves(dexKey);
    
    let prices, reserves;
    if (Array.isArray(result)) {
      [prices, reserves] = result;
    } else if (result && typeof result === 'object') {
      prices = result.prices_ || result[0] || result.prices;
      reserves = result.reserves_ || result[1] || result.reserves;
    } else {
      throw new Error(`Unexpected result format: ${typeof result}`);
    }
    
    const currentPrice = prices.poolPrice;
    const currentPriceFormatted = ethers.utils.formatUnits(currentPrice, 27);
    
    // Fetch actual token balances from the pool contract
    const usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDC);
    const usdt = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDT);
    
    const poolUsdcBalance = await usdc.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
    const poolUsdtBalance = await usdt.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
    
    console.log(`✅ Current pool price: ${currentPriceFormatted}`);
    console.log(`✅ Pool actual balances: ${ethers.utils.formatUnits(poolUsdcBalance, 6)} USDC, ${ethers.utils.formatUnits(poolUsdtBalance, 6)} USDT`);
    console.log(`ℹ️  Resolver real reserves: ${ethers.utils.formatUnits(reserves.token0RealReserves, 6)} USDC, ${ethers.utils.formatUnits(reserves.token1RealReserves, 6)} USDT`);
    
    return {
      currentPrice: currentPrice.toString(),
      currentPriceFormatted,
      reserves: {
        usdc: poolUsdcBalance, // Use actual balance instead of resolver reserves
        usdt: poolUsdtBalance  // Use actual balance instead of resolver reserves
      }
    };
    
  } catch (error: any) {
    console.log(`❌ Failed to fetch pool data: ${error.message}`);
    console.log(`💡 Using manual input mode. Make sure to set appropriate values.`);
    return null;
  }
};

// Helper function to confirm calldata generation
const confirmCalldataGeneration = async (usdcAmount: string, usdtAmount: string, currentPrice: string, upperSlippagePercent: string, lowerSlippagePercent: string, multiplier?: string): Promise<boolean> => {
  // Calculate slippage prices
  const currentPriceBN = BigNumber.from(currentPrice);
  const upperSlippageBps = Math.floor(parseFloat(upperSlippagePercent) * 100); // Convert to basis points
  const lowerSlippageBps = Math.floor(parseFloat(lowerSlippagePercent) * 100); // Convert to basis points
  
  const priceMaxBN = currentPriceBN.mul(10000 + upperSlippageBps).div(10000);
  const priceMinBN = currentPriceBN.mul(10000 - lowerSlippageBps).div(10000);
  
  console.log(`\n📋 Calldata Generation Summary:`);
  console.log(`  USDC amount: ${usdcAmount} USDC`);
  console.log(`  USDT amount: ${usdtAmount} USDT`);
  if (multiplier) {
    console.log(`  Multiplier: ${multiplier}x`);
  }
  console.log(`  Current Price: ${ethers.utils.formatUnits(currentPrice, 27)}`);
  console.log(`  Upper Slippage: ${upperSlippagePercent}%`);
  console.log(`  Lower Slippage: ${lowerSlippagePercent}%`);
  console.log(`  Max Price: ${ethers.utils.formatUnits(priceMaxBN, 27)} (${upperSlippagePercent}% above current)`);
  console.log(`  Min Price: ${ethers.utils.formatUnits(priceMinBN, 27)} (${lowerSlippagePercent}% below current)`);
  console.log(`  Network: ${hre.network.name}`);
  
  const confirmation = await promptUser(`\n❓ Do you want to generate the calldata? (yes/no): `);
  return confirmation.toLowerCase() === 'yes' || confirmation.toLowerCase() === 'y';
};

export const prodDepositUsdcUsdtDexLite = async (
  usdcAmount: string = "50", // Default: 50 USDC
  usdtAmount: string = "50", // Default: 50 USDT
  gasPriceGwei: string = "0.02", // Default: 0.02 gwei
  currentPrice: string = "1000000000000000000000000000", // Default: 1.0 * 1e27
  upperSlippagePercent: string = "0.5", // Default: 0.5% upper slippage
  lowerSlippagePercent: string = "0.5" // Default: 0.5% lower slippage
) => {
  // Get network-specific configuration and deployment addresses
  const config = getNetworkConfig();
  const deploymentAddresses = await getDeploymentAddresses();
  const networkName = hre.network.name;
  
  console.log(`💰 Depositing USDC/USDT to DexLite on ${networkName}`);
  console.log(`Target Amounts: ${usdcAmount} USDC + ${usdtAmount} USDT`);

  console.log(`📍 Contract Addresses:`);
  console.log(`  FluidDexLite: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`  AdminModule: ${deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS}`);

  const deployer = "0x4F6F977aCDD1177DCD81aB83074855EcB9C2D49e";
  console.log("Depositor address:", deployer);

  // Get contract instances
  const dexLite = await ethers.getContractAt("FluidDexLite", deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
  const adminModule = await ethers.getContractAt("FluidDexLiteAdminModule", deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS);

  // Get ERC20 token interfaces
  const usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDC);
  const usdt = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDT);

  // Parse amounts (6 decimals for both USDC and USDT)
  const token0Amount = ethers.utils.parseUnits(usdcAmount, 6);
  const token1Amount = ethers.utils.parseUnits(usdtAmount, 6);

  // Parse current price and slippage percentages
  const currentPriceBN = BigNumber.from(currentPrice);
  const upperSlippageBps = Math.floor(parseFloat(upperSlippagePercent) * 100); // Convert to basis points
  const lowerSlippageBps = Math.floor(parseFloat(lowerSlippagePercent) * 100); // Convert to basis points
  
  // Calculate price bounds based on current price and slippage percentages
  const priceMaxBN = currentPriceBN.mul(10000 + upperSlippageBps).div(10000);
  const priceMinBN = currentPriceBN.mul(10000 - lowerSlippageBps).div(10000);

  // Check deployer balances
  const deployerUsdcBalance = await usdc.balanceOf(deployer);
  const deployerUsdtBalance = await usdt.balanceOf(deployer);
  
  console.log(`\\n💰 Current Balances:`);
  console.log(`  Depositor USDC: ${ethers.utils.formatUnits(deployerUsdcBalance, 6)} USDC`);
  console.log(`  Depositor USDT: ${ethers.utils.formatUnits(deployerUsdtBalance, 6)} USDT`);

  // Verify sufficient balances
  if (deployerUsdcBalance.lt(token0Amount)) {
    throw new Error(`Insufficient USDC balance. Need ${usdcAmount} USDC, have ${ethers.utils.formatUnits(deployerUsdcBalance, 6)} USDC`);
  }
  if (deployerUsdtBalance.lt(token1Amount)) {
    throw new Error(`Insufficient USDT balance. Need ${usdtAmount} USDT, have ${ethers.utils.formatUnits(deployerUsdtBalance, 6)} USDT`);
  }

  // Create DexKey struct (must match the one used during initialization)
  const dexKey = {
    token0: config.USDC,
    token1: config.USDT,
    salt: ethers.constants.HashZero // Same salt as used in initialization
  };

  // Check current pool balances before deposit
  const poolUsdcBalance = await usdc.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);
  const poolUsdtBalance = await usdt.balanceOf(deploymentAddresses.FLUID_DEX_LITE_ADDRESS);

  console.log(`\\n📊 Pool Balances (before deposit):`);
  console.log(`  Pool USDC: ${ethers.utils.formatUnits(poolUsdcBalance, 6)} USDC`);
  console.log(`  Pool USDT: ${ethers.utils.formatUnits(poolUsdtBalance, 6)} USDT`);

  console.log("\\n📋 Deposit Parameters:");
  console.log(`  Network: ${networkName}`);
  console.log(`  USDC to deposit: ${usdcAmount} USDC`);
  console.log(`  USDT to deposit: ${usdtAmount} USDT`);
  console.log(`  Current Price: ${ethers.utils.formatUnits(currentPriceBN, 27)}`);
  console.log(`  Upper Slippage: ${upperSlippagePercent}%`);
  console.log(`  Lower Slippage: ${lowerSlippagePercent}%`);
  console.log(`  Max Price: ${ethers.utils.formatUnits(priceMaxBN, 27)} (${upperSlippagePercent}% above current)`);
  console.log(`  Min Price: ${ethers.utils.formatUnits(priceMinBN, 27)} (${lowerSlippagePercent}% below current)`);
  console.log(`  Depositor: ${deployer}`);

  // Parse gas price
  const gasPrice = ethers.utils.parseUnits(gasPriceGwei, "gwei");

  // Transaction details already confirmed in main function

  // Encode the deposit function call
  const depositData = adminModule.interface.encodeFunctionData("deposit", [
    dexKey,
    token0Amount,
    token1Amount,
    priceMaxBN,
    priceMinBN
  ]);

  // Encode the fallback data (target address + spell data)
  const fallbackData = ethers.utils.defaultAbiCoder.encode(
    ["address", "bytes"],
    [deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS, depositData]
  );

  console.log("\\n📋 Raw Calldata for Deposit Transaction:");
  console.log("=".repeat(60));
  console.log(`Target Contract: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`Calldata: ${fallbackData}`);
  console.log("=".repeat(60));
  
  console.log("\\n📊 Transaction Parameters:");
  console.log(`  To: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`  Data: ${fallbackData}`);
  console.log(`  Gas Limit: 500000`);
  console.log(`  Gas Price: ${gasPriceGwei} gwei (${ethers.utils.formatUnits(gasPrice, "gwei")} gwei)`);
  
  console.log("\\n📋 Deposit Function Details:");
  console.log(`  Function: deposit(DexKey, uint256, uint256, uint256, uint256)`);
  console.log(`  DexKey:`);
  console.log(`    token0: ${dexKey.token0}`);
  console.log(`    token1: ${dexKey.token1}`);
  console.log(`    salt: ${dexKey.salt}`);
  console.log(`  token0Amount: ${token0Amount.toString()} (${usdcAmount} USDC)`);
  console.log(`  token1Amount: ${token1Amount.toString()} (${usdtAmount} USDT)`);
  console.log(`  priceMax: ${priceMaxBN.toString()}`);
  console.log(`  priceMin: ${priceMinBN.toString()}`);
  
  console.log("\\n📋 Fallback Data Breakdown:");
  console.log(`  Target Address: ${deploymentAddresses.FLUID_DEX_LITE_ADMIN_MODULE_ADDRESS}`);
  console.log(`  Deposit Function Data: ${depositData}`);
  
  console.log("\\n💡 To execute this transaction manually:");
  console.log(`  1. Ensure you have approved ${usdcAmount} USDC to ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`  2. Ensure you have approved ${usdtAmount} USDT to ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);
  console.log(`  3. Send transaction to ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS} with calldata: ${fallbackData}`);

  return fallbackData;
};

// Main execution function with interactive input
const main = async () => {
  console.log(`💰 USDC/USDT DexLite Calldata Generation Script`);
  console.log(`Network: ${hre.network.name}\n`);

  // Get network-specific configuration and deployment addresses
  const config = getNetworkConfig();
  const deploymentAddresses = await getDeploymentAddresses();

  // Fetch current pool data from resolver
  const poolData = await fetchCurrentPriceFromResolver(deploymentAddresses, config);
  
  let currentPrice: string;
  let usdcAmount: string;
  let usdtAmount: string;
  
  let multiplier: string | undefined;
  
  if (poolData) {
    // Use resolver data
    currentPrice = poolData.currentPrice;
    const poolUsdcReserves = ethers.utils.formatUnits(poolData.reserves.usdc, 6);
    const poolUsdtReserves = ethers.utils.formatUnits(poolData.reserves.usdt, 6);
    
    console.log(`\n📊 Current Pool State:`);
    console.log(`  Pool USDC: ${poolUsdcReserves} USDC`);
    console.log(`  Pool USDT: ${poolUsdtReserves} USDT`);
    console.log(`  Current Price: ${poolData.currentPriceFormatted}`);
    
    // Prompt for multiplier
    multiplier = await promptUser(`📈 Enter deposit multiplier (e.g., 2 = double the pool size): `);
    const multiplierNum = parseFloat(multiplier);
    
    if (isNaN(multiplierNum) || multiplierNum <= 0) {
      throw new Error("❌ Invalid multiplier. Please enter a positive number.");
    }
    
    // Calculate deposit amounts based on multiplier
    const depositUsdcAmount = poolData.reserves.usdc.mul(Math.floor(multiplierNum * 1000000)).div(1000000);
    const depositUsdtAmount = poolData.reserves.usdt.mul(Math.floor(multiplierNum * 1000000)).div(1000000);
    
    usdcAmount = ethers.utils.formatUnits(depositUsdcAmount, 6);
    usdtAmount = ethers.utils.formatUnits(depositUsdtAmount, 6);
    
    console.log(`\n💰 Calculated Deposit Amounts:`);
    console.log(`  Multiplier: ${multiplierNum}x`);
    console.log(`  USDC to deposit: ${usdcAmount} USDC`);
    console.log(`  USDT to deposit: ${usdtAmount} USDT`);
  } else {
    // Fallback to manual input
    console.log(`\n⚠️  Using manual input mode (resolver unavailable)`);
    usdcAmount = await promptUser(`💵 Enter USDC amount to deposit: `);
    usdtAmount = await promptUser(`💵 Enter USDT amount to deposit: `);
    currentPrice = await promptUser(`💰 Enter current price [default: 1000000000000000000000000000]: `) || "1000000000000000000000000000";
  }
  
  const upperSlippagePercent = await promptUser(`📈 Enter upper slippage percentage [default: 0.5]: `) || "0.5";
  const lowerSlippagePercent = await promptUser(`📉 Enter lower slippage percentage [default: 0.5]: `) || "0.5";

  // Validate inputs
  if (!usdcAmount || isNaN(Number(usdcAmount)) || Number(usdcAmount) <= 0) {
    throw new Error("❌ Invalid USDC amount. Please enter a positive number.");
  }
  if (!usdtAmount || isNaN(Number(usdtAmount)) || Number(usdtAmount) <= 0) {
    throw new Error("❌ Invalid USDT amount. Please enter a positive number.");
  }
  
  // Validate price and slippage parameters
  try {
    const currentPriceBN = BigNumber.from(currentPrice);
    if (currentPriceBN.lte(0)) {
      throw new Error("❌ Current price must be greater than 0.");
    }
    
    const upperSlippage = parseFloat(upperSlippagePercent);
    const lowerSlippage = parseFloat(lowerSlippagePercent);
    
    if (isNaN(upperSlippage) || upperSlippage < 0 || upperSlippage > 10) {
      throw new Error("❌ Upper slippage must be between 0 and 10 percent.");
    }
    if (isNaN(lowerSlippage) || lowerSlippage < 0 || lowerSlippage > 10) {
      throw new Error("❌ Lower slippage must be between 0 and 10 percent.");
    }
  } catch (error) {
    throw new Error("❌ Invalid price or slippage values. Please enter valid numbers.");
  }

  // Confirm calldata generation
  const confirmed = await confirmCalldataGeneration(usdcAmount, usdtAmount, currentPrice, upperSlippagePercent, lowerSlippagePercent, multiplier);
  if (!confirmed) {
    console.log("❌ Calldata generation cancelled by user.");
    return;
  }

  // Generate calldata (using default gas price for display purposes)
  await prodDepositUsdcUsdtDexLite(usdcAmount, usdtAmount, "0.02", currentPrice, upperSlippagePercent, lowerSlippagePercent);
};

// Allow running directly
if (require.main === module) {
  main().catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
  });
}