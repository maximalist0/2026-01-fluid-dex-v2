import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidStETHQueue__factory } from "../../../typechain-types";

export const setConfigStETHMaxLTV = async (hre: HardhatRuntimeEnvironment, maxLTV: number) => {
  logDebug("-----------------------------------------\n Execute setMaxLTV() at StETH protocol:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting max LTV): ", maxLTV);

  const proxy = await hre.deployments.get("StETHQueueProxy");

  const stETH = FluidStETHQueue__factory.connect(proxy.address, deployer);
  const populatedTx = await stETH.populateTransaction.setMaxLTV(maxLTV);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidStETHQueue__factory.abi),
    stETH.address,
    FluidStETHQueue__factory.createInterface().getFunction("setMaxLTV").format(),
    {
      maxLTV_: maxLTV,
    }
  );
};
