import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT2Admin__factory } from "../../../typechain-types";
import { VaultT2CoreSettings } from "../../settings";

export const setConfigVaultT2CoreSettings = async (
  hre: HardhatRuntimeEnvironment,
  vaultT2: string,
  coreSettings: VaultT2CoreSettings
) => {
  logDebug("-----------------------------------------\n Execute updateCoreSettings() at VaultT2:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting core settings): ", JSON.stringify(coreSettings), " for vaultT2: ", vaultT2);

  const vaultT2Admin = FluidVaultT2Admin__factory.connect(vaultT2, deployer);
  const populatedTx = await vaultT2Admin.populateTransaction.updateCoreSettings(
    coreSettings.supplyRate,
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
    JSON.stringify(FluidVaultT2Admin__factory.abi),
    (await hre.deployments.get("VaultT2Admin")).address,
    FluidVaultT2Admin__factory.createInterface().getFunction("updateCoreSettings").format(),
    {
      supplyRate_: coreSettings.supplyRate,
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
