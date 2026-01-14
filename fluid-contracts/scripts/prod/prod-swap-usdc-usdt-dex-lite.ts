import hre from "hardhat";
import { ethers } from "hardhat";
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
    
    return {
      FLUID_DEX_LITE_ADDRESS: fluidDexLite.address
    };
  } catch (error) {
    throw new Error(`Failed to get deployment addresses. Make sure contracts are deployed on ${hre.network.name}: ${error}`);
  }
};

// Note: Gas price is now provided interactively by the user

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
const confirmTransaction = async (swapAmount: string, direction: string, gasPrice: string): Promise<boolean> => {
  console.log(`\n📋 Transaction Summary:`);
  console.log(`  Amount: ${swapAmount} ${direction === 'usdc-to-usdt' ? 'USDC' : 'USDT'}`);
  console.log(`  Direction: ${direction === 'usdc-to-usdt' ? 'USDC → USDT' : 'USDT → USDC'}`);
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Gas Price: ${gasPrice} gwei`);
  
  const confirmation = await promptUser(`\n❓ Do you want to proceed with this swap? (yes/no): `);
  return confirmation.toLowerCase() === 'yes' || confirmation.toLowerCase() === 'y';
};

export const prodSwapUsdcUsdtDexLite = async (
  swapAmount: string,
  direction: string = 'usdc-to-usdt', // 'usdc-to-usdt' or 'usdt-to-usdc'
  gasPriceGwei: string = "0.02" // Default: 0.02 gwei
) => {
  // Get network-specific configuration and deployment addresses
  const config = getNetworkConfig();
  const deploymentAddresses = await getDeploymentAddresses();
  const networkName = hre.network.name;
  
  const swapDirection = direction === 'usdc-to-usdt';
  console.log(`🔄 Performing ${swapAmount} ${swapDirection ? 'USDC → USDT' : 'USDT → USDC'} swap on Fluid DexLite (${networkName})`);

  console.log(`📍 Contract Address:`);
  console.log(`  FluidDexLite: ${deploymentAddresses.FLUID_DEX_LITE_ADDRESS}`);

  const deployer = await deployerAddress(hre);
  console.log("Trader address:", deployer);

  // Get contract instances
  const dexLite = await ethers.getContractAt("FluidDexLite", deploymentAddresses.FLUID_DEX_LITE_ADDRESS);

  // Get ERC20 token interfaces
  const usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDC);
  const usdt = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", config.USDT);

  // Check initial balances
  const initialUsdcBalance = await usdc.balanceOf(deployer);
  const initialUsdtBalance = await usdt.balanceOf(deployer);
  
  console.log(`\n💰 Initial Balances:`);
  console.log(`  USDC: ${ethers.utils.formatUnits(initialUsdcBalance, 6)} USDC`);
  console.log(`  USDT: ${ethers.utils.formatUnits(initialUsdtBalance, 6)} USDT`);

  // Parse swap amount (6 decimals for both tokens)
  const parsedSwapAmount = ethers.utils.parseUnits(swapAmount, 6);

  // Verify sufficient balance
  if (swapDirection) {
    if (initialUsdcBalance.lt(parsedSwapAmount)) {
      throw new Error(`Insufficient USDC balance. Need ${swapAmount} USDC, have ${ethers.utils.formatUnits(initialUsdcBalance, 6)} USDC`);
    }
  } else {
    if (initialUsdtBalance.lt(parsedSwapAmount)) {
      throw new Error(`Insufficient USDT balance. Need ${swapAmount} USDT, have ${ethers.utils.formatUnits(initialUsdtBalance, 6)} USDT`);
    }
  }

  // Create DexKey struct (same as used in initialization)
  const dexKey = {
    token0: config.USDC,
    token1: config.USDT,
    salt: ethers.constants.HashZero // Same salt as used in initialization
  };

  // Set up swap parameters
  const swap0To1 = swapDirection; // true for USDC → USDT, false for USDT → USDC
  const amountSpecified = parsedSwapAmount; // Exact input amount
  const amountLimit = 0; // Minimum output (0 for testing, could be set for slippage protection)
  const to = deployer; // Receive tokens to deployer address
  const isCallback = false; // No callback needed for ERC20 tokens
  const callbackData = ethers.utils.arrayify("0x"); // Empty callback data as proper bytes

  console.log(`\n📋 Swap Parameters:`);
  console.log(`  Network: ${networkName}`);
  console.log(`  Input: ${swapAmount} ${swapDirection ? 'USDC' : 'USDT'}`);
  console.log(`  Path: ${swapDirection ? 'USDC → USDT' : 'USDT → USDC'}`);
  console.log(`  Minimum Output: ${ethers.utils.formatUnits(amountLimit, 6)} ${swapDirection ? 'USDT' : 'USDC'}`);
  console.log(`  Gas Price: ${gasPriceGwei} gwei`);

  // Transaction details already confirmed in main function

  // Approve appropriate token for DexLite contract
  const tokenToApprove = swapDirection ? usdc : usdt;
  const tokenSymbol = swapDirection ? 'USDC' : 'USDT';
  
  console.log(`\n✅ Approving ${swapAmount} ${tokenSymbol}...`);
  
  const approveTx = await tokenToApprove.approve(deploymentAddresses.FLUID_DEX_LITE_ADDRESS, parsedSwapAmount, {
    gasPrice: ethers.utils.parseUnits(gasPriceGwei, "gwei")
  });
  await approveTx.wait();
  console.log(`Approved ${swapAmount} ${tokenSymbol} for swap`);

  console.log(`\n🔄 Executing swap...`);

  // Perform the swap - capture return values directly
  const swapResult = await dexLite.callStatic.swapSingle(
    dexKey,
    swap0To1,
    amountSpecified,
    amountLimit,
    to,
    isCallback,
    callbackData,
    ethers.utils.arrayify("0x") // extraData
  );

  // Now execute the actual transaction
  const swapTx = await dexLite.swapSingle(
    dexKey,
    swap0To1,
    amountSpecified,
    amountLimit,
    to,
    isCallback,
    callbackData,
    ethers.utils.arrayify("0x"), // extraData
    { 
      gasLimit: 500000, // Set a reasonable gas limit
      gasPrice: ethers.utils.parseUnits(gasPriceGwei, "gwei")
      // Alternative EIP-1559 approach (uncomment if preferred):
      // maxFeePerGas: ethers.utils.parseUnits("1", "gwei"),        // 1 gwei max total
      // maxPriorityFeePerGas: ethers.utils.parseUnits("0.01", "gwei") // 0.01 gwei priority tip
    }
  );

  const receipt = await swapTx.wait();

  // Get return values from the static call
  const amountOut = swapResult; // amountUnspecified (output amount for exact input)

  // Check final balances
  const finalUsdcBalance = await usdc.balanceOf(deployer);
  const finalUsdtBalance = await usdt.balanceOf(deployer);

  // Calculate actual amounts based on swap direction
  let tokenSpent, tokenReceived, spentSymbol, receivedSymbol;
  if (swapDirection) {
    tokenSpent = initialUsdcBalance.sub(finalUsdcBalance);
    tokenReceived = finalUsdtBalance.sub(initialUsdtBalance);
    spentSymbol = 'USDC';
    receivedSymbol = 'USDT';
  } else {
    tokenSpent = initialUsdtBalance.sub(finalUsdtBalance);
    tokenReceived = finalUsdcBalance.sub(initialUsdcBalance);
    spentSymbol = 'USDT';
    receivedSymbol = 'USDC';
  }

  logSuccess("✅ Swap completed successfully!");
  
  console.log(`\n📊 Swap Results:`);
  console.log(`  Network: ${networkName}`);
  console.log(`  Transaction Hash: ${receipt.transactionHash}`);
  console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(`  ${spentSymbol} Spent: ${ethers.utils.formatUnits(tokenSpent, 6)} ${spentSymbol}`);
  console.log(`  ${receivedSymbol} Received: ${ethers.utils.formatUnits(tokenReceived, 6)} ${receivedSymbol}`);
  console.log(`  Contract Return - Amount Out: ${ethers.utils.formatUnits(amountOut, 6)} ${receivedSymbol}`);
  
  // Calculate exchange rate
  if (tokenSpent.gt(0)) {
    const exchangeRate = tokenReceived.mul(ethers.utils.parseUnits("1", 6)).div(tokenSpent);
    console.log(`  Exchange Rate: 1 ${spentSymbol} = ${ethers.utils.formatUnits(exchangeRate, 6)} ${receivedSymbol}`);
  }

  console.log(`\n💰 Final Balances:`);
  console.log(`  USDC: ${ethers.utils.formatUnits(finalUsdcBalance, 6)} USDC`);
  console.log(`  USDT: ${ethers.utils.formatUnits(finalUsdtBalance, 6)} USDT`);

  // Calculate price impact (deviation from 1:1 for stablecoin pair)
  if (tokenSpent.gt(0)) {
    const priceImpact = ethers.utils.parseUnits("1", 6).sub(tokenReceived.mul(ethers.utils.parseUnits("1", 6)).div(tokenSpent));
    const priceImpactPercent = priceImpact.mul(10000).div(ethers.utils.parseUnits("1", 6));
    console.log(`  Price Impact: ${ethers.utils.formatUnits(priceImpactPercent, 2)}%`);
  }

  return {
    transactionHash: receipt.transactionHash,
    tokenSpent: tokenSpent.toString(),
    tokenReceived: tokenReceived.toString(),
    contractAmountOut: amountOut.toString(),
    gasUsed: receipt.gasUsed.toString()
  };
};

// Main execution function with interactive input
const main = async () => {
  console.log(`🔄 USDC/USDT DexLite Swap Script`);
  console.log(`Network: ${hre.network.name}\n`);

  // Prompt for swap direction using swap0To1 (true/false)
  console.log(`🔀 Swap Direction:`);
  console.log(`  - true: USDC → USDT (swap0To1 = true)`);
  console.log(`  - false: USDT → USDC (swap0To1 = false)`);
  const swap0To1Input = await promptUser(`Enter swap0To1 (true/false): `);

  // Validate swap direction
  let swap0To1: boolean;
  if (swap0To1Input.toLowerCase() === 'true') {
    swap0To1 = true;
  } else if (swap0To1Input.toLowerCase() === 'false') {
    swap0To1 = false;
  } else {
    throw new Error("❌ Invalid direction. Please enter 'true' or 'false'.");
  }

  const tokenInSymbol = swap0To1 ? 'USDC' : 'USDT';
  const tokenOutSymbol = swap0To1 ? 'USDT' : 'USDC';

  // Prompt for tokenIn amount
  const tokenInAmount = await promptUser(`💵 Enter amount of ${tokenInSymbol} to swap: `);

  // Validate input
  if (!tokenInAmount || isNaN(Number(tokenInAmount)) || Number(tokenInAmount) <= 0) {
    throw new Error("❌ Invalid token amount. Please enter a positive number.");
  }

  // Convert to internal direction format for existing function
  const direction = swap0To1 ? 'usdc-to-usdt' : 'usdt-to-usdc';

  // Prompt for gas price
  const gasPriceGwei = await promptUser(`⛽ Enter gas price in gwei (e.g., 0.02, 1, 5): `);

  // Validate gas price
  if (!gasPriceGwei || isNaN(Number(gasPriceGwei)) || Number(gasPriceGwei) <= 0) {
    throw new Error("❌ Invalid gas price. Please enter a positive number.");
  }

  // Confirm transaction
  const confirmed = await confirmTransaction(tokenInAmount, direction, gasPriceGwei);
  if (!confirmed) {
    console.log("❌ Transaction cancelled by user.");
    return;
  }

  // Execute swap
  await prodSwapUsdcUsdtDexLite(tokenInAmount, direction, gasPriceGwei);
};

// Allow running directly
if (require.main === module) {
  main().catch((error: any) => {
    console.error(error);
    process.exitCode = 1;
  });
} 