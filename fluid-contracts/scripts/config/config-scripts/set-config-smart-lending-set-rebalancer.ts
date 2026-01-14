import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidSmartLending__factory } from "../../../typechain-types";

export const setConfigSmartLendingSetRebalancer = async (
  hre: HardhatRuntimeEnvironment,
  smartLending: string,
  rebalancer: string
) => {
  logDebug("-----------------------------------------\n Execute setRebalancer() at Smart lending:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting rebalancer): ", rebalancer, " for smart lending: ", smartLending);

  const smartLendingAdmin = FluidSmartLending__factory.connect(smartLending, deployer);
  const populatedTx = await smartLendingAdmin.populateTransaction.setRebalancer(rebalancer);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidSmartLending__factory.abi),
    smartLending,
    FluidSmartLending__factory.createInterface().getFunction("setRebalancer").format(),
    {
      rebalancer_: rebalancer,
    }
  );
};
