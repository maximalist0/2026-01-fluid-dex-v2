import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import {
  configCoreLending,
  configCoreLiquidity,
  configCoreReserve,
  configCoreVault,
  configPeripheryWallet,
} from "../config";
import { FluidVersion } from "../settings";
import { logDebug, logSuccess, TxQueue } from "../util";

export const newChainInitialConfigs = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID NEW CHAIN INITIAL CONFIGS -------------------\n");

  const version: FluidVersion = "v1_0_0";

  await configCoreReserve(hre, version);

  await configCoreLiquidity(hre, version);

  await configCoreLending(hre, version);

  await configCoreVault(hre, version);

  await configPeripheryWallet(hre, version);

  await TxQueue.processQueue(hre, "initial-configs");

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "initial configs!\n"));
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. Import the json file into Avocado transaction builder and execute.\n",
    "2. Double check all configs!\n",
    "3. List tokens, add vaults etc. See docs / README.\n"
  );
};
