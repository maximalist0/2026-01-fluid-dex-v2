import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import {
  deployLiquidationContract,
  deployLiquidatorImplementationContract,
  deployLiquidatorProxyContract,
  deployMigrationContract,
  deployVaultLiquidationResolver,
  deployVaultPositionsResolver,
} from "../deploy/deploy-scripts";
import { deployBuyback, deployFluidWallet } from "../deploy/periphery";
import { logDebug, logSuccess, TxQueue } from "../util";

import { FluidVersion, peripheryContractsConfig } from "../settings";

export const prodDeployPeriphery = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID PERIPHERY DEPLOYMENT -------------------\n");

  const version: FluidVersion = "v1_0_0";

  const config = peripheryContractsConfig(hre.network.name);

  // const implementationsV1 = await deployLiquidatorImplementationContract(
  //   hre,
  //   version,
  //   config.liquidation.fla,
  //   config.liquidation.weth
  // );
  
  // await deployLiquidatorProxyContract(
  //   hre,
  //   version,
  //   config.liquidation.owner,
  //   config.liquidation.rebalancers,
  //   [implementationsV1]
  // );

  // await deployMigrationContract(
  //   hre,
  //   version,
  //   config.migration.owner,
  //   config.migration.fla,
  //   config.migration.weth,
  //   config.migration.oldFactory,
  //   config.migration.newFactory
  // );

  // await deployFluidWallet(hre, version);

  // // deploy vault positions resolver
  // await deployVaultPositionsResolver(hre, version);

  // // deploy vault liquidation resolver
  // await deployVaultLiquidationResolver(hre, version);

  await deployBuyback(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "periphery deployment!\n")
  );
};
