import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { deployLiquidity, deployLending, deployVault, deployReserve, deployFluidWallet, deployDex } from "../deploy";
import { logDebug, logSuccess, TxQueue } from "../util";
import { FluidVersion, peripheryContractsConfig } from "../settings";
import {
  deployLiquidationContract,
  deployLiquidatorImplementationContract,
  deployLiquidatorProxyContract,
  deployLiquidators,
  deploySmartLendingResolver,
} from "../deploy/deploy-scripts";
import { deployDeployerFactory } from "../deploy/deploy-scripts/deployer";
import { AVOCADO_TEAM_MULTISIG } from "../settings/contract-addresses";

export const newChainDeployDex = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID NEW CHAIN DEPLOYMENT -------------------\n");

  const version: FluidVersion = "v1_0_0";

  await deployDex(hre, version);

  // deploy dex factory logic T1
  // await deployDexT1DeploymentLogic(hre, version);

  // vault deployment logics
  // await deployVaultT234DeploymentLogic(hre, version, VAULT_TYPE.T2_SMART_COL);
  // await deployVaultT234DeploymentLogic(hre, version, VAULT_TYPE.T3_SMART_DEBT);
  // await deployVaultT234DeploymentLogic(hre, version, VAULT_TYPE.T4_SMART_COL_SMART_DEBT);

  await deploySmartLendingResolver(hre, version);

  await TxQueue.processQueue(hre, hre.network.name + "-deploy");

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "new chain deployment!\n")
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. mark the proxy contracts as proxy on the block explorer.\n",
    "2. execute setting initial config txs (upgrade proxies, set configs etc.): `npx hardhat run scripts/new-chain-initial-configs.ts --network <network>`\n"
  );
};
