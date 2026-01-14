import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT1Admin__factory } from "../../../typechain-types";

export const setConfigVaultT1234LML = async (hre: HardhatRuntimeEnvironment, vault: string, lml: number) => {
  logDebug("-----------------------------------------\n Execute updateLiquidationMaxLimit() at vault:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting LML): ", lml, " for vault: ", vault);

  const vaultT1Admin = FluidVaultT1Admin__factory.connect(vault, deployer);
  const populatedTx = await vaultT1Admin.populateTransaction.updateLiquidationMaxLimit(lml);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT1Admin__factory.abi),
    (await hre.deployments.get("VaultT1Admin")).address,
    FluidVaultT1Admin__factory.createInterface().getFunction("updateLiquidationMaxLimit").format(),
    {
      liquidationMaxLimit_: lml,
    }
  );
};
