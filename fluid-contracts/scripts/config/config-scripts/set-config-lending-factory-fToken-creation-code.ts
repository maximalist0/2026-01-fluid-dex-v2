import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidLendingFactory__factory } from "../../../typechain-types";

export const setConfigLendingFactoryfTokenCreationCode = async (
  hre: HardhatRuntimeEnvironment,
  fTokenType: string,
  creationCode: string
) => {
  logDebug("-----------------------------------------\n Execute setFTokenCreationCode() at LendingFactory:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting fToken creation code for fTokenType): ", fTokenType);

  const lendingFactory = FluidLendingFactory__factory.connect(
    (await hre.deployments.get("LendingFactory")).address,
    deployer
  );

  const populatedTx = await lendingFactory.populateTransaction.setFTokenCreationCode(fTokenType, creationCode);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidLendingFactory__factory.abi),
    lendingFactory.address,
    FluidLendingFactory__factory.createInterface().getFunction("setFTokenCreationCode").format(),
    {
      fTokenType_: fTokenType,
      creationCode_: creationCode,
    }
  );
};
