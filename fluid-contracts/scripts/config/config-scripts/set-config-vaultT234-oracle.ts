import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultT2Admin__factory } from "../../../typechain-types";

export const setConfigVaultT234Oracle = async (hre: HardhatRuntimeEnvironment, vault: string, oracleNonce: number) => {
  logDebug("-----------------------------------------\n Execute updateOracle() at vault:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting oracle nonce): ", oracleNonce, " for vault: ", vault);

  const vaultT2Admin = FluidVaultT2Admin__factory.connect(vault, deployer);
  const populatedTx = await vaultT2Admin.populateTransaction.updateOracle(oracleNonce);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultT2Admin__factory.abi),
    (await hre.deployments.get("VaultT2Admin")).address,
    FluidVaultT2Admin__factory.createInterface().getFunction("updateOracle").format(),
    {
      newOracleNonce_: oracleNonce,
    }
  );
};
