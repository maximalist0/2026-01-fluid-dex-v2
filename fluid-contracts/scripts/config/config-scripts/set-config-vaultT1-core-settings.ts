import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT1Admin__factory } from "../../../typechain-types";
import { VaultCoreSettings } from "../../settings";

export const setConfigVaultT1CoreSettings = async (
  hre: HardhatRuntimeEnvironment,
  vaultT1: string,
  coreSettings: VaultCoreSettings
) => {
  logDebug("-----------------------------------------\n Execute updateCoreSettings() at VaultT1:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting core settings): ", JSON.stringify(coreSettings), " for vaultT1: ", vaultT1);

  const vaultT1Admin = FluidVaultT1Admin__factory.connect(vaultT1, deployer);
  const populatedTx = await vaultT1Admin.populateTransaction.updateCoreSettings(
    coreSettings.supplyRateMagnifier,
    coreSettings.borrowRateMagnifier,
    coreSettings.collateralFactor,
    coreSettings.liquidationThreshold,
    coreSettings.liquidationMaxLimit,
    coreSettings.withdrawGap,
    coreSettings.liquidationPenalty,
    coreSettings.borrowFee
  );

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT1Admin__factory.abi),
    (await hre.deployments.get("VaultT1Admin")).address,
    FluidVaultT1Admin__factory.createInterface().getFunction("updateCoreSettings").format(),
    {
      supplyRateMagnifier_: coreSettings.supplyRateMagnifier,
      borrowRateMagnifier_: coreSettings.borrowRateMagnifier,
      collateralFactor_: coreSettings.collateralFactor,
      liquidationThreshold_: coreSettings.liquidationThreshold,
      liquidationMaxLimit_: coreSettings.liquidationMaxLimit,
      withdrawGap_: coreSettings.withdrawGap,
      liquidationPenalty_: coreSettings.liquidationPenalty,
      borrowFee_: coreSettings.borrowFee,
    }
  );
};
