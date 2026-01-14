import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { deployStETH } from "../deploy";
import { isLocalNetwork, logDebug, logSuccess, TxQueue } from "../util";
import { FluidVersion } from "../settings";
import { LIDO_WITHDRAWAL_QUEUE } from "../settings/contract-addresses";
import { configCoreStETH } from "../config";

export const prodDeployStETH = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID STETH DEPLOYMENT -------------------\n");

  const version: FluidVersion = "v1_0_0";

  if (
    hre.network.name !== "mainnet" &&
    !(isLocalNetwork(hre.network.name) && (await hre.ethers.provider.getCode(LIDO_WITHDRAWAL_QUEUE)) != "0x")
  ) {
    throw new Error("StETH unsupported on this network");
  }

  await deployStETH(hre, version); // can be deployed on ETH Mainnet

  // @dev Note: no config executed on deployment, instead the process was executed manually:
  // At Team Multisig: upgrade from EmptyImplementationUUPS to actual logic contract.
  // Then, governance executed in one single TX:
  // 1. Set borrow allowance at Liquidity.
  // 2. Call initialize (only possible after 1.). Sets owner to Governance.
  // 3. Set allowed address Lite Vault DSA.
  // 4. Set Team Multisig as Guardian.
  // 5. Set maxLTV.

  // await configCoreStETH(hre, version); // can be deployed on ETH Mainnet

  // await TxQueue.processQueue(hre, "steth-deploy");

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "StETH protocol deployment!\n")
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. mark the proxy contract as proxy on the block explorer.\n",
    "2. execute setting configs for stETH protocol`\n"
  );
};
