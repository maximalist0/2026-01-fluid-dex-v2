import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FToken__factory } from "../../../typechain-types";

import { deployerSigner, logDebug, TxQueue } from "../../util";

export const setConfigFTokenUpdateRewards = async (
  hre: HardhatRuntimeEnvironment,
  fTokenAddress: string,
  lendingRewardsRateModel: string
) => {
  logDebug("-----------------------------------------\n Execute updateRewards() at fToken:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting lendingRewardsRateModel):", lendingRewardsRateModel);

  const fToken = FToken__factory.connect(fTokenAddress, deployer);
  const populatedTx = await fToken.populateTransaction.updateRewards(lendingRewardsRateModel);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FToken__factory.abi),
    fTokenAddress,
    FToken__factory.createInterface().getFunction("updateRewards").format(),
    {
      rewardsRateModel_: lendingRewardsRateModel,
    }
  );
};
