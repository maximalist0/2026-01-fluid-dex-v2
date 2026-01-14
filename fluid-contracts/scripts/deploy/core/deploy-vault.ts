import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import {
  deployVaultT1Admin,
  deployVaultFactory,
  deployVaultT1DeploymentLogic,
  deployVaultResolver,
  deployVaultT1Secondary,
  deployVaultPositionsResolver,
  deployVaultTicksBranchesResolver,
  deployVaultLiquidationResolver,
  deployVaultT1Resolver,
} from "../deploy-scripts";

export const deployVault = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- VAULT PROTOCOL -------------------\n");

  // Note VaultFactory is deployed via branch "new-chain-deploy-core-frozen"

  // deploy VaultT1Admin
  await deployVaultT1Admin(hre, version);

  // deploy VaultT1Secondary
  await deployVaultT1Secondary(hre, version);

  // deploy vault factory logic T1
  await deployVaultT1DeploymentLogic(hre, version);

  // deploy vault resolver
  await deployVaultResolver(hre, version);

  // deploy vault T1 resolver
  await deployVaultT1Resolver(hre, version);

  // deploy vault positions resolver
  await deployVaultPositionsResolver(hre, version);

  // deploy vault branches & ticks resolver
  await deployVaultTicksBranchesResolver(hre, version);

  await deployVaultLiquidationResolver(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "Vault protocol deployment!\n")
  );
};
