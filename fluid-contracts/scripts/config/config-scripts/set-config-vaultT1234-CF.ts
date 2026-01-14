import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT1Admin__factory } from "../../../typechain-types";

export const setConfigVaultT1234CF = async (hre: HardhatRuntimeEnvironment, vault: string, cf: number) => {
  logDebug("-----------------------------------------\n Execute updateCollateralFactor() at vault:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting CF): ", cf, " for vault: ", vault);

  const vaultT1Admin = FluidVaultT1Admin__factory.connect(vault, deployer);
  const populatedTx = await vaultT1Admin.populateTransaction.updateCollateralFactor(cf);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT1Admin__factory.abi),
    (await hre.deployments.get("VaultT1Admin")).address,
    FluidVaultT1Admin__factory.createInterface().getFunction("updateCollateralFactor").format(),
    {
      collateralFactor_: cf,
    }
  );
};
