import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT1Admin__factory } from "../../../typechain-types";

export const setConfigVaultT1234LP = async (hre: HardhatRuntimeEnvironment, vault: string, lp: number) => {
  logDebug("-----------------------------------------\n Execute updateLiquidationPenalty() at vault:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting LP): ", lp, " for vault: ", vault);

  const vaultT1Admin = FluidVaultT1Admin__factory.connect(vault, deployer);
  const populatedTx = await vaultT1Admin.populateTransaction.updateLiquidationPenalty(lp);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT1Admin__factory.abi),
    (await hre.deployments.get("VaultT1Admin")).address,
    FluidVaultT1Admin__factory.createInterface().getFunction("updateLiquidationPenalty").format(),
    {
      liquidationPenalty_: lp,
    }
  );
};
