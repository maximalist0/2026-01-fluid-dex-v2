import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT1Admin__factory } from "../../../typechain-types";

export const setConfigVaultT1234LT = async (hre: HardhatRuntimeEnvironment, vaultT1: string, lt: number) => {
  logDebug("-----------------------------------------\n Execute updateLiquidationThreshold() at vault:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting LT): ", lt, " for vaultT1: ", vaultT1);

  const vaultT1Admin = FluidVaultT1Admin__factory.connect(vaultT1, deployer);
  const populatedTx = await vaultT1Admin.populateTransaction.updateLiquidationThreshold(lt);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT1Admin__factory.abi),
    (await hre.deployments.get("VaultT1Admin")).address,
    FluidVaultT1Admin__factory.createInterface().getFunction("updateLiquidationThreshold").format(),
    {
      liquidationThreshold_: lt,
    }
  );
};
