import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FToken__factory } from "../../../typechain-types";

import { deployerSigner, logDebug, TxQueue } from "../../util";

export const setConfigFTokenUpdateRebalancer = async (
  hre: HardhatRuntimeEnvironment,
  fTokenAddress: string,
  rebalancer: string
) => {
  logDebug("-----------------------------------------\n Execute updateRebalancer() at fToken:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting rebalancer):", rebalancer);

  const fToken = FToken__factory.connect(fTokenAddress, deployer);
  const populatedTx = await fToken.populateTransaction.updateRebalancer(rebalancer);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FToken__factory.abi),
    fTokenAddress,
    FToken__factory.createInterface().getFunction("updateRebalancer").format(),
    {
      newRebalancer_: rebalancer,
    }
  );
};
