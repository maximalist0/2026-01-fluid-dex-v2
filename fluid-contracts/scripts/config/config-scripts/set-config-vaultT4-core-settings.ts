import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT4Admin__factory } from "../../../typechain-types";
import { VaultT4CoreSettings } from "../../settings";

export const setConfigVaultT4CoreSettings = async (
  hre: HardhatRuntimeEnvironment,
  vaultT4: string,
  coreSettings: VaultT4CoreSettings
) => {
  logDebug("-----------------------------------------\n Execute updateCoreSettings() at VaultT4:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting core settings): ", JSON.stringify(coreSettings), " for vaultT4: ", vaultT4);

  const vaultT4Admin = FluidVaultT4Admin__factory.connect(vaultT4, deployer);
  const populatedTx = await vaultT4Admin.populateTransaction.updateCoreSettings(
    coreSettings.supplyRate,
    coreSettings.borrowRate,
    coreSettings.collateralFactor,
    coreSettings.liquidationThreshold,
    coreSettings.liquidationMaxLimit,
    coreSettings.withdrawGap,
    coreSettings.liquidationPenalty,
    coreSettings.borrowFee
  );

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT4Admin__factory.abi),
    (await hre.deployments.get("VaultT4Admin")).address,
    FluidVaultT4Admin__factory.createInterface().getFunction("updateCoreSettings").format(),
    {
      supplyRate_: coreSettings.supplyRate,
      borrowRate_: coreSettings.borrowRate,
      collateralFactor_: coreSettings.collateralFactor,
      liquidationThreshold_: coreSettings.liquidationThreshold,
      liquidationMaxLimit_: coreSettings.liquidationMaxLimit,
      withdrawGap_: coreSettings.withdrawGap,
      liquidationPenalty_: coreSettings.liquidationPenalty,
      borrowFee_: coreSettings.borrowFee,
    }
  );
};
