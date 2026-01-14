import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess, throwIfAddressZero } from "../../util";
import { coreContractsConfig, FluidVersion } from "../../settings";
import {
  setConfigLendingFactoryfTokenCreationCode,
  setConfigLendingFactorySetAuth,
  setConfigLendingFactorySetDeployer,
} from "../config-scripts";

export const configCoreLending = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n------------------------ LENDING CONFIGS -------------------\n");

  // set fTokenTypes at factory
  await setConfigLendingFactoryfTokenCreationCode(
    hre,
    "fToken",
    (
      await hre.deployments.getArtifact("fToken")
    ).bytecode
  );
  await setConfigLendingFactoryfTokenCreationCode(
    hre,
    "NativeUnderlying",
    (
      await hre.deployments.getArtifact("fTokenNativeUnderlying")
    ).bytecode
  );

  // set auths at factory
  const allowedAuths = coreContractsConfig().lending.lendingFactory.auths;
  for (const allowedAuth of allowedAuths) {
    await setConfigLendingFactorySetAuth(hre, throwIfAddressZero(allowedAuth, "LendingFactory auth"));
  }

  // set deployers at factory
  const allowedDeployers = coreContractsConfig().lending.lendingFactory.deployers;
  for (const allowedDeployer of allowedDeployers) {
    await setConfigLendingFactorySetDeployer(hre, throwIfAddressZero(allowedDeployer, "LendingFactory deployer"));
  }

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Done all steps for Fluid", version.replace(/_/g, "."), "Lending config txs!\n"));
};
