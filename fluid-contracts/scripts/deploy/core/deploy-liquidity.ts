import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import {
  deployEmptyImplementation,
  deployLiquidityAdminModule,
  deployLiquidityDummyImpl,
  deployLiquidityProxy,
  deployLiquidityResolver,
  deployLiquidityUserModule,
  deployRevenueResolver,
} from "../deploy-scripts";
import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";

export const deployLiquidity = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- LIQUIDITY -------------------\n");

  // Note Liquidity proxy is deployed via branch "new-chain-deploy-core-frozen"

  // deploy dummy implementation
  await deployLiquidityDummyImpl(hre, version);

  // deploy AdminModule
  await deployLiquidityAdminModule(hre, version);

  // deploy UserModule
  await deployLiquidityUserModule(hre, version);

  // deploy Liquidity Resolver
  await deployLiquidityResolver(hre, version);

  await deployRevenueResolver(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "Liquidity deployment!\n")
  );
};
