import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import {
  deployDexT1DeploymentLogic,
  deployDexResolver,
  deployDexReservesResolver,
  deploySSTORE2Deployer,
} from "../deploy-scripts";

export const deployDex = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- DEX PROTOCOL -------------------\n");

  // Note DexFactory is already deployed

  await deploySSTORE2Deployer(hre, version);

  // deploy dex resolver
  await deployDexResolver(hre, version);

  // deploy dex reserves resolver
  await deployDexReservesResolver(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "Dex protocol deployment!\n")
  );
};
