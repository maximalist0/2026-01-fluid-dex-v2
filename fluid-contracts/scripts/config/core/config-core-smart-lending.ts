import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import { setConfigSmartLendingFactorySmartLendingCreationCode } from "../config-scripts";
import { deployViaSStore2 } from "../../deploy/deploy-scripts/dex/deploy-via-sstore2";

export const configCoreSmartLending = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n------------------------ SMART LENDING CONFIGS -------------------\n");

  const creationCode = (await hre.deployments.getArtifact("FluidSmartLending")).bytecode;

  // DO ONE OF THE FOLLOWING DEPENDING ON IGP OR MULTISIG:

  // write smart lending creation code to SSTORE2Deployer (when setting via IGP)
  await deployViaSStore2(hre, creationCode);

  // set smartLending creationCode at factory via Multisig
  // await setConfigSmartLendingFactorySmartLendingCreationCode(hre, creationCode);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Done all steps for Fluid", version.replace(/_/g, "."), "Smart Lending config txs!\n")
  );
};
