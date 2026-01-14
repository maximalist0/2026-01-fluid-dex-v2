import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidSmartLendingFactory__factory } from "../../../typechain-types";

export const setConfigSmartLendingFactorySmartLendingCreationCode = async (
  hre: HardhatRuntimeEnvironment,
  creationCode: string
) => {
  logDebug("-----------------------------------------\n Execute setSmartLendingCreationCode() at SmartLendingFactory:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting smartLending creation code): ");

  const smartLendingFactory = FluidSmartLendingFactory__factory.connect(
    (await hre.deployments.get("SmartLendingFactory")).address,
    deployer
  );

  const populatedTx = await smartLendingFactory.populateTransaction.setSmartLendingCreationCode(creationCode);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidSmartLendingFactory__factory.abi),
    smartLendingFactory.address,
    FluidSmartLendingFactory__factory.createInterface().getFunction("setSmartLendingCreationCode").format(),
    {
      creationCode_: creationCode,
    }
  );
};
