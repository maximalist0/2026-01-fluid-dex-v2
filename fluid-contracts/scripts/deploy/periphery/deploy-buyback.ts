import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import { deployBuybackProxy } from "../deploy-scripts/periphery/buyback/deploy-buyback-proxy";
import { deployBuybackImplementation } from "../deploy-scripts/periphery/buyback/deploy-buyback-implementation";

export const deployBuyback = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- FLUID BUYBACK -------------------\n");
  
  await deployBuybackImplementation(hre, version);
  
  await deployBuybackProxy(hre);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "Fluid Buyback deployment!\n")
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "After a first Fluid buyback has been deployed via the Proxy, execute `verifyFluidBuyback` see custom deploy script.\n"
  );
};
