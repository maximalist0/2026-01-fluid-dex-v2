import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultFactory__factory } from "../../../typechain-types";

export const setConfigVaultFactorySetGlobalAuth = async (
  hre: HardhatRuntimeEnvironment,
  auth: string,
  allowed: boolean
) => {
  logDebug("-----------------------------------------\n Execute setGlobalAuth() at VaultFactory:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting auth as " + allowed ? "allowed" : "not allowed" + "): ", auth);

  const vaultFactory = FluidVaultFactory__factory.connect(
    (await hre.deployments.get("VaultFactory")).address,
    deployer
  );
  const populatedTx = await vaultFactory.populateTransaction.setGlobalAuth(auth, allowed);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultFactory__factory.abi),
    vaultFactory.address,
    FluidVaultFactory__factory.createInterface().getFunction("setGlobalAuth").format(),
    {
      globalAuth_: auth,
      allowed_: allowed,
    }
  );
};
