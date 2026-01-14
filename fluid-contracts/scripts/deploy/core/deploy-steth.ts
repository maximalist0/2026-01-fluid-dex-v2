import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import { deployStETHProxy, deployStETHQueue, deployStETHResolver } from "../deploy-scripts";

export const deployStETH = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- STETH PROTOCOL -------------------\n");

  await deployStETHQueue(hre, version);

  await deployStETHProxy(hre);

  await deployStETHResolver(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "StETH protocol deployment!\n")
  );
};
