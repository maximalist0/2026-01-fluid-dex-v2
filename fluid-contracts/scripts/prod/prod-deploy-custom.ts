import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import { BigNumber } from "ethers";

import { logDebug, logSuccess, TxQueue } from "../util";
import { FluidVersion, TOKENS_MAINNET, VAULT_TYPE, TOKENS_ARBITRUM, TOKENS_PLASMA } from "../settings";
import {
  deployBufferRateConfigHandler,
  deployCollectRevenueAuth,
  deployContractRateEBTC,
  deployContractRateEZETH,
  deployContractRateLBTC,
  deployContractRateRSETH,
  deployContractRateSUSDE,
  deployContractRateSUSDS,
  deployContractRateWEETH,
  deployContractRateWEETHS,
  deployContractRateWSTETH,
  deployDexFeeAuth,
  deployDexFeeHandler,
  deployDexReservesResolver,
  deployDexResolver,
  deployEthenaRateConfigHandler,
  deployLendingResolver,
  deployLimitsAuth,
  deployLimitsAuthDex,
  deployLiquidityAdminModule,
  deployLiquidityResolver,
  deployLiquidityTokenAuth,
  deployLiquidityUserModule,
  deployMaxBorrowConfigHandler,
  deployMerkleDistributor,
  deployRangeAuthDex,
  deployRatesAuth,
  deployRevenueResolver,
  deploySmartLendingResolver,
  deployStakingMerkleResolver,
  deployStaticCenterPrice,
  deployVaultFeeRewardsAuth,
  deployVaultLiquidationResolver,
  deployVaultResolver,
  deployVaultT1Resolver,
  deployVaultT234DeploymentLogic,
  deployWethWrapperWithProxy,
  deployWithdrawLimitAuth,
  deployWithdrawLimitAuthDex,
  verifyFluidWallet,
} from "../deploy/deploy-scripts";
import { deployDexFactory, deploySmartLendingFactory } from "../deploy/deploy-scripts/dex";
import { deployDeployerFactory } from "../deploy/deploy-scripts/deployer";
import { AVOCADO_TEAM_MULTISIG } from "../settings/contract-addresses";
import { deployDex } from "../deploy";
import { setConfigDexFeeAndRevenueCut } from "../config";

// @dev template script for any custom deployment e.g. when just deploying a specific contract.
// just call the deploy method in here and execute `npx hardhat run scripts/deploy-custom.ts --network mainnet`

export const prodDeployCustom = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID CUSTOM SCRIPT DEPLOYMENT -------------------\n");

  const version: FluidVersion = "v1_0_0";

  // await setConfigDexFeeAndRevenueCut(hre, TOKENS_PLASMA.DEX_USDE_USDT.address, 100, 25e4);
  // await TxQueue.processQueue(hre, "deploy-custom");

  // await deployDexFeeAuth(hre, version);
  // await deployLiquidityTokenAuth(hre, version);
  // await deployVaultFeeRewardsAuth(hre, version);
  // await deployRatesAuth(hre, version);
  // await deployRangeAuthDex(hre, version);
  // await deployLimitsAuth(hre, version);
  // await deployLimitsAuthDex(hre, version);

  // await deployWithdrawLimitAuth(hre, version);
  // await deployWithdrawLimitAuthDex(hre, version);

  // await deployDexFeeHandler(
  //   hre,
  //   version,
  //   10, // uint256 constant MIN_FEE = 30;
  //   100, // uint256 constant MAX_FEE = 100;
  //   BigNumber.from(10).pow(23).mul(2), // uint256 constant MIN_DEVIATION = 2e23;
  //   BigNumber.from(10).pow(24), // uint256 constant MAX_DEVIATION = 1e24;
  //   TOKENS_MAINNET.DEX_USDC_USDT.address,
  //   "USDC_USDT"
  // );

  // await deployDexFeeHandler(
  //   hre,
  //   version,
  //   20, // MIN FEE
  //   150, // MAX FEE
  //   BigNumber.from(10).pow(23).mul(2), // uint256 constant MIN_DEVIATION = 2e23; 0.02% depeg
  //   BigNumber.from(10).pow(22).mul(75), // uint256 constant MAX_DEVIATION = 75e22;  0.075% depeg
  //   true, // centerPriceActive
  //   TOKENS_MAINNET.DEX_WSTETH_ETH.address,
  //   "WSTETH_ETH"
  // );

  // await deployDexFeeHandler(
  //   hre,
  //   version,
  //   30, // MIN FEE
  //   150, // MAX FEE
  //   BigNumber.from(10).pow(22).mul(20), // uint256 constant MIN_DEVIATION = 20e22; 0.02% depeg
  //   BigNumber.from(10).pow(22).mul(50), // uint256 constant MAX_DEVIATION = 50e22  0.05% depeg
  //   false, // centerPriceActive
  //   TOKENS_MAINNET.DEX_USDE_USDT.address,
  //   "USDE_USDT"
  // );

  // await deployDexFeeHandler(
  //   hre,
  //   version,
  //   30, // MIN FEE
  //   300, // MAX FEE
  //   BigNumber.from(10).pow(22).mul(50), // uint256 constant MIN_DEVIATION = 20e22; 0.05% depeg
  //   BigNumber.from(10).pow(22).mul(300), // uint256 constant MAX_DEVIATION = 300e22  0.3% depeg
  //   true, // centerPriceActive
  //   TOKENS_MAINNET.DEX_SUSDE_USDT.address,
  //   "SUSDE_USDT"
  // );

  // await deployDexFeeHandler(
  //   hre,
  //   version,
  //   100, // MIN FEE
  //   200, // MAX FEE
  //   BigNumber.from(10).pow(22).mul(15), // uint256 constant MIN_DEVIATION = 15e22; 0.015% depeg
  //   BigNumber.from(10).pow(22).mul(30), // uint256 constant MAX_DEVIATION = 30e22;  0.03% depeg
  //   true, // centerPriceActive
  //   TOKENS_MAINNET.DEX_WEETH_ETH.address,
  //   "WEETH_ETH"
  // );

  // wethWrapper ETH-USDC vault for dHedge
  // await deployWethWrapperWithProxy(hre, version, "0x0C8C77B7FF4c2aF7F6CEBbe67350A490E3DD6cB3", "ETH_USDC_dHegde");

  // await deployVaultT234DeploymentLogic(hre, version, VAULT_TYPE.T2_SMART_COL);
  // await deployVaultT234DeploymentLogic(hre, version, VAULT_TYPE.T3_SMART_DEBT);
  // await deployVaultT234DeploymentLogic(hre, version, VAULT_TYPE.T4_SMART_COL_SMART_DEBT);

  // await deployWithdrawLimitAuth(hre, version);

  // await deployStaticCenterPrice(
  //   hre,
  //   version,
  //   "StaticCenterPrice9985",
  //   "Static center price 0.9985",
  //   "998500000000000000000000000"
  // );
  // await deployStaticCenterPrice(
  //   hre,
  //   version,
  //   "StaticCenterPrice1",
  //   "Static center price 1",
  //   "1000000000000000000000000000"
  // );
  // await deployStaticCenterPrice(
  //   hre,
  //   version,
  //   "StaticCenterPriceFLUID",
  //   "Static center price Fluid",
  //   "3401944444444444400000000"
  // );

  // e.g. here:
  // await deployEthenaRateConfigHandler(hre, version);
  // await deployMaxBorrowConfigHandler(hre, version);
  // await deployBufferRateConfigHandler(hre, version);

  // await deployContractRateWSTETH(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateWEETH(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateRSETH(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateWEETHS(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateSUSDE(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateSUSDS(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateLBTC(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateEBTC(hre, version, 10, 25 * 60 * 60);
  // await deployContractRateEZETH(hre, version, 10, 25 * 60 * 60);

  // await deployDexFactory(hre, version);
  // await deployDexReservesResolver(hre, version);
  // await deployDexResolver(hre, version);

  // await deploySmartLendingFactory(hre, version);
  // await deploySmartLendingResolver(hre, version);

  // await deployLiquidityTokenAuth(hre, version);
  // await deployCollectRevenueAuth(hre, version);

  // MerkleDistributor proposer :
  // EOA address: 0xb287f8A01a9538656c72Fa6aE1EE0117A187Be0C
  // Avocado address: 0x3BE5C671b20649DCA5D916b5698328D54BdAAf88
  // await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "0x4F6F977aCDD1177DCD81aB83074855EcB9C2D49e", // owner
  //   "0x3BE5C671b20649DCA5D916b5698328D54BdAAf88" // proposer
  // );

  // Main MerkleDistributor proposer :
  // EOA address: 0xb287f8A01a9538656c72Fa6aE1EE0117A187Be0C
  // Avocado address: 0x3BE5C671b20649DCA5D916b5698328D54BdAAf88
  // await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "deUSD-USDC Smart Lending FLUID Rewards - Jan 2025",
  //   "0x9800020b610194dBa52CF606E8Aa142F9F256166", // owner
  //   "0x4f104710f8d9F6EFB28c4b2f057554928Daa3a83", // proposer
  //   "0x85dC44E0c3AfdFedCa52678bD4C000917C6597B2", // approver
  //   "0x6f40d4a6237c257fff2db00fa0510deeecd303eb" // reward token INST
  // );

  // // Test MerkleDistributor proposer :
  // await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "Test Deployment #1",
  //   "0x9800020b610194dBa52CF606E8Aa142F9F256166", // owner
  //   "0x910E413DBF3F6276Fe8213fF656726bDc142E08E", // proposer
  //   "0x910E413DBF3F6276Fe8213fF656726bDc142E08E", // approver
  //   "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" // reward token USDC
  // );

  // // // Dynamic MerkleDistributor proposer:
  // await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "GHO Vaults $FLUID rewards - Apr 2025",
  //   "0x9800020b610194dBa52CF606E8Aa142F9F256166", // owner
  //   "0x4f104710f8d9F6EFB28c4b2f057554928Daa3a83", // proposer
  //   "0x85dC44E0c3AfdFedCa52678bD4C000917C6597B2", // approver
  //   "0x6f40d4a6237c257fff2db00fa0510deeecd303eb", // reward token INST
  //   1, // distributionInHours
  //   1, // cycleInHours
  //   0, // startBlock
  //   false // pullFromDistributor
  // );

  // Dynamic With Vesting MerkleDistributor proposer:
  //  await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "$FLUID rewards - Jul 2025",
  //   "0x9800020b610194dBa52CF606E8Aa142F9F256166", // owner
  //   // "0x910E413DBF3F6276Fe8213fF656726bDc142E08E", // proposer
  //   // "0x910E413DBF3F6276Fe8213fF656726bDc142E08E", // approver
  //   "0x4f104710f8d9F6EFB28c4b2f057554928Daa3a83", // proposer
  //   "0x85dC44E0c3AfdFedCa52678bD4C000917C6597B2", // approver
  //   // "0x6f40d4a6237c257fff2db00fa0510deeecd303eb", // reward token INST Mainnet
  //   "0x61e030a56d33e8260fdd81f03b162a79fe3449cd", // reward token INST Arbitrum
  //   1, // distributionInHours
  //   1, // cycleInHours
  //   0, // startBlock
  //   false, // pullFromDistributor
  //   // 365 * 24 * 60 * 60, // vestingTime - 1 year
  //   0, // vestingTime
  //   // 1751673600 // vestingStartTime - 2025-07-05 00:00:00 UTC
  //   0, // vestingStartTime
  // );

  // await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "$USDC rewards SYRUPUSDC - Sep 2025",
  //   "0x9800020b610194dBa52CF606E8Aa142F9F256166", // owner
  //   "0x4f104710f8d9F6EFB28c4b2f057554928Daa3a83", // proposer
  //   "0x85dC44E0c3AfdFedCa52678bD4C000917C6597B2", // approver
  //   // "0x6f40d4a6237c257fff2db00fa0510deeecd303eb", // reward token INST Mainnet
  //   TOKENS_ARBITRUM.USDC.address, // reward token USDC Arbitrum
  //   1, // distributionInHours
  //   1, // cycleInHours
  //   0, // startBlock
  //   false, // pullFromDistributor
  //   0, // vestingTime
  //   0 // vestingStartTime
  // );

  // await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "$FLUID rewards - Oct 2025",
  //   "0x9800020b610194dBa52CF606E8Aa142F9F256166", // owner
  //   "0x4f104710f8d9F6EFB28c4b2f057554928Daa3a83", // proposer
  //   "0x85dC44E0c3AfdFedCa52678bD4C000917C6597B2", // approver
  //   TOKENS_PLASMA.FLUID.address, // reward token FLUID
  //   1, // distributionInHours
  //   1, // cycleInHours
  //   0, // startBlock
  //   false, // pullFromDistributor
  //   0, // vestingTime
  //   0 // vestingStartTime
  // );

  // await deployMerkleDistributor(
  //   hre,
  //   version,
  //   "$USDC rewards SYRUPUSDC - Oct 2025",
  //   "0x9800020b610194dBa52CF606E8Aa142F9F256166", // owner
  //   "0x4f104710f8d9F6EFB28c4b2f057554928Daa3a83", // proposer
  //   "0x85dC44E0c3AfdFedCa52678bD4C000917C6597B2", // approver
  //   TOKENS_MAINNET.USDC.address, // reward token USDC
  //   1, // distributionInHours
  //   1, // cycleInHours
  //   0, // startBlock
  //   false, // pullFromDistributor
  //   0, // vestingTime
  //   0 // vestingStartTime
  // );

  // e.g. verify fluid wallet at address "0x12d07dec54565839e0c4c33f6b94e5ad5be00e23" after deployment
  // await verifyFluidWallet(hre, "0x12D07dEC54565839E0C4c33F6b94e5AD5BE00E23");

  // await deployDex(hre, version);

  // await deployLiquidityAdminModule(hre, version);

  // await deployLiquidityResolver(hre, version);
  // await deployRevenueResolver(hre, version);
  // await deployVaultResolver(hre, version);
  // await deployVaultT1Resolver(hre, version);
  // await deployLendingResolver(hre, version);
  // await deployDexReservesResolver(hre, version);
  // await deployDexResolver(hre, version);
  // await deploySmartLendingResolver(hre, version);
  // await deployVaultLiquidationResolver(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline(
      "Executed all steps for Fluid",
      version.replace(/_/g, "."),
      "custom specific script deployment!\n"
    )
  );
};
