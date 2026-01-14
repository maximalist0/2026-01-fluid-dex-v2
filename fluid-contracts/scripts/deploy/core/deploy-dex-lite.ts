import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import {
  deployDexLite,
  deployDexLiteAdminModule,
  deployDexLiteResolver,
} from "../deploy-scripts";

export const deployDexLiteProtocol = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- DEX LITE PROTOCOL -------------------\n");

  // deploy FluidDexLite core contract
  await deployDexLite(hre, version);

  // deploy FluidDexLiteAdminModule
  await deployDexLiteAdminModule(hre, version);

  // deploy FluidDexLiteResolver
  await deployDexLiteResolver(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "DexLite protocol deployment!\n")
  );
};