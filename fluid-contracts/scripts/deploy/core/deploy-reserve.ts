import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import {
  deployEmptyImplementationUUPS,
  deployReserveContract,
  deployReserveContractAuthHandler,
  deployReserveProxy,
} from "../deploy-scripts";

export const deployReserve = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- RESERVE RELATED CONTRACTS -------------------\n");

  await deployEmptyImplementationUUPS(hre);

  await deployReserveProxy(hre);

  await deployReserveContract(hre, version);

  await deployReserveContractAuthHandler(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline(
      "Executed all steps for Fluid",
      version.replace(/_/g, "."),
      "reserve related contracts deployment!\n"
    )
  );
};
