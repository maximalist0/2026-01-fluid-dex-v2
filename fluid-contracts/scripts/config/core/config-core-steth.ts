import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { deployerSigner, logDebug, logSuccess, throwIfAddressZero, throwIfNumberZeroOrAboveMax } from "../../util";
import { coreContractsConfig, DEFAULT_HUNDRED_PERCENT, FluidVersion } from "../../settings";
import { setConfigStETHMaxLTV, setConfigUpgradeProxy } from "../config-scripts";
import { FluidStETHQueue__factory } from "../../../typechain-types";

export const configCoreStETH = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n------------------------ STETH CONFIGS -------------------\n");

  const proxyAddress = (await hre.deployments.get("StETHQueueProxy")).address;

  const owner = throwIfAddressZero(coreContractsConfig().steth.owner, "StETH Owner");

  const stETHQueue = FluidStETHQueue__factory.connect(proxyAddress, await deployerSigner(hre));
  // check if initialize was already executed on stETHProxy (only upgrade)
  const initializedStorageVar = await hre.ethers.provider.getStorageAt(proxyAddress, 0);
  let initializeCalldata = "";
  if (initializedStorageVar !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
    initializeCalldata = (await stETHQueue.populateTransaction.initialize(owner)).data as string;
  }

  if (initializeCalldata === "") {
    logDebug("Skipped initialize() at StETHQueueProxy because it was already executed before.");
  } else {
    logDebug("Added initialize() to be executed at StETHQueueProxy");
  }

  // upgrade proxy from EmptyImplementationUUPS to actual StETHQueue impl and set owner in initialize
  await setConfigUpgradeProxy(hre, proxyAddress, (await hre.deployments.get("StETHQueue")).address, initializeCalldata);

  // set maxLTV at steth protocol
  await setConfigStETHMaxLTV(
    hre,
    throwIfNumberZeroOrAboveMax(coreContractsConfig().steth.maxLTV, DEFAULT_HUNDRED_PERCENT, "StETH maxLTV")
  );

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Done all steps for Fluid", version.replace(/_/g, "."), "StETH config txs!\n"));
};
