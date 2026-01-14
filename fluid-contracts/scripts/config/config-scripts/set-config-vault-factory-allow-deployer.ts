import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultFactory__factory } from "../../../typechain-types";

export const setConfigVaultFactoryAllowDeployer = async (
  hre: HardhatRuntimeEnvironment,
  factoryDeployer: string,
  allowed: boolean
) => {
  logDebug("-----------------------------------------\n Execute setDeployer() at VaultFactory:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting deployer as " + allowed ? "allowed" : "not allowed" + "): ", factoryDeployer);

  const vaultFactory = FluidVaultFactory__factory.connect(
    (await hre.deployments.get("VaultFactory")).address,
    deployer
  );
  const populatedTx = await vaultFactory.populateTransaction.setDeployer(factoryDeployer, allowed);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultFactory__factory.abi),
    vaultFactory.address,
    FluidVaultFactory__factory.createInterface().getFunction("setDeployer").format(),
    {
      deployer_: factoryDeployer,
      allowed_: allowed,
    }
  );
};
