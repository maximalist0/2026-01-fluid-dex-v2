import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidLendingFactory__factory } from "../../../typechain-types";

export const setConfigLendingFactorySetAuth = async (hre: HardhatRuntimeEnvironment, auth: string) => {
  logDebug("-----------------------------------------\n Execute setAuth() at LendingFactory:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting allowed auth):", auth);

  const lendingFactory = FluidLendingFactory__factory.connect(
    (await hre.deployments.get("LendingFactory")).address,
    deployer
  );
  const populatedTx = await lendingFactory.populateTransaction.setAuth(auth, true);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidLendingFactory__factory.abi),
    lendingFactory.address,
    FluidLendingFactory__factory.createInterface().getFunction("setAuth").format(),
    {
      auth_: auth,
      allowed_: true,
    }
  );
};
