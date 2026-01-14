import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT1Admin__factory } from "../../../typechain-types";

export const setConfigVaultT1Oracle = async (hre: HardhatRuntimeEnvironment, vaultT1: string, oracle: string) => {
  logDebug("-----------------------------------------\n Execute updateOracle() at VaultT1:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting oracle): ", oracle, " for vaultT1: ", vaultT1);

  const vaultT1Admin = FluidVaultT1Admin__factory.connect(vaultT1, deployer);
  const populatedTx = await vaultT1Admin.populateTransaction.updateOracle(oracle);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT1Admin__factory.abi),
    (await hre.deployments.get("VaultT1Admin")).address,
    FluidVaultT1Admin__factory.createInterface().getFunction("updateOracle").format(),
    {
      newOracle_: oracle,
    }
  );
};
