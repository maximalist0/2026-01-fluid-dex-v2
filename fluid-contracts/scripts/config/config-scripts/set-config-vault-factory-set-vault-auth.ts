import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultFactory__factory } from "../../../typechain-types";

export const setConfigVaultFactorySetVaultAuth = async (
  hre: HardhatRuntimeEnvironment,
  vault: string,
  auth: string,
  allowed: boolean
) => {
  logDebug("-----------------------------------------\n Execute setVaultAuth() at VaultFactory:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting auth as " + allowed ? "allowed" : "not allowed" + "): ", auth, " at vault: ", vault);

  const vaultFactory = FluidVaultFactory__factory.connect(
    (await hre.deployments.get("VaultFactory")).address,
    deployer
  );
  const populatedTx = await vaultFactory.populateTransaction.setVaultAuth(vault, auth, allowed);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultFactory__factory.abi),
    vaultFactory.address,
    FluidVaultFactory__factory.createInterface().getFunction("setVaultAuth").format(),
    {
      vault_: vault,
      vaultAuth_: auth,
      allowed_: allowed,
    }
  );
};
