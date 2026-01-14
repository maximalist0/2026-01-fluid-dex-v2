import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess, throwIfAddressZero } from "../../util";
import { coreContractsConfig, FluidVersion } from "../../settings";
import {
  setConfigVaultFactoryAllowDeployer,
  setConfigVaultFactoryDeploymentLogic,
  setConfigVaultFactorySetGlobalAuth,
} from "../config-scripts";

export const configCoreVault = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n------------------------ VAULT CONFIGS -------------------\n");

  // allow list deployment logic at vault factory
  await setConfigVaultFactoryDeploymentLogic(hre, (await hre.deployments.get("VaultT1DeploymentLogic")).address);

  // set deployers at factory
  const allowedDeployers = coreContractsConfig().vault.vaultFactory.deployers;
  for (const allowedDeployer of allowedDeployers) {
    await setConfigVaultFactoryAllowDeployer(hre, throwIfAddressZero(allowedDeployer, "VaultFactory deployer"), true);
  }

  // set global auths at factory
  const allowedGlobalAuths = coreContractsConfig().vault.vaultFactory.globalAuths;
  for (const allowedGlobalAuth of allowedGlobalAuths) {
    await setConfigVaultFactorySetGlobalAuth(
      hre,
      throwIfAddressZero(allowedGlobalAuth, "VaultFactory globalAuth"),
      true
    );
  }

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Done all steps for Fluid", version.replace(/_/g, "."), "Vault config txs!\n"));
};
