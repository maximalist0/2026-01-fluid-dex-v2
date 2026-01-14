import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidLendingFactory__factory } from "../../../typechain-types";

export const setConfigLendingFactorySetDeployer = async (hre: HardhatRuntimeEnvironment, deployer: string) => {
  logDebug("-----------------------------------------\n Execute setDeployer() at LendingFactory:");

  logDebug("(setting allowed deployer):", deployer);

  const lendingFactory = FluidLendingFactory__factory.connect(
    (await hre.deployments.get("LendingFactory")).address,
    await deployerSigner(hre)
  );
  const populatedTx = await lendingFactory.populateTransaction.setDeployer(deployer, true);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidLendingFactory__factory.abi),
    lendingFactory.address,
    FluidLendingFactory__factory.createInterface().getFunction("setDeployer").format(),
    {
      deployer_: deployer,
      allowed_: true,
    }
  );
};
