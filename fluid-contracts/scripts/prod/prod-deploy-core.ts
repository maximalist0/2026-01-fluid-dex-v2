import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { deployLiquidity, deployLending, deployVault, deployReserve } from "../deploy";
import { logDebug, logSuccess, TxQueue } from "../util";
import { FluidVersion } from "../settings";

export const prodDeployCore = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID CORE DEPLOYMENT -------------------\n");

  const version: FluidVersion = "v1_0_0";

  await deployLiquidity(hre, version);

  await deployReserve(hre, version);

  await deployLending(hre, version);

  await deployVault(hre, version);

  await TxQueue.processQueue(hre, "core-deploy");

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "core deployment!\n"));
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. mark the proxy contracts as proxy on the block explorer.\n",
    "2. execute setting initial config txs (upgrade proxies, set configs etc.): `npx hardhat run scripts/prod-core-configs.ts --network <network>`\n"
  );
};
