import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import {
  deployFluidWalletFactoryProxy,
  deployWalletFactory,
  deployWalletImplementation,
} from "../deploy-scripts/periphery/wallet";

export const deployFluidWallet = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- FLUID WALLET -------------------\n");

  await deployFluidWalletFactoryProxy(hre);

  await deployWalletFactory(hre, version);

  await deployWalletImplementation(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "Fluid Wallet deployment!\n")
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "After a first Fluid wallet has been deployed via the Factory, execute `verifyFluidWallet` see custom deploy script.\n"
  );
};
