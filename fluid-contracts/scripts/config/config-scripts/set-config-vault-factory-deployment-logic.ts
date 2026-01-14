import { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployerSigner, logDebug, TxQueue } from "../../util";
import { FluidVaultFactory__factory } from "../../../typechain-types";

export const setConfigVaultFactoryDeploymentLogic = async (hre: HardhatRuntimeEnvironment, deploymentLogic: string) => {
  logDebug("-----------------------------------------\n Execute setVaultDeploymentLogic() at VaultFactory:");

  const deployer = await deployerSigner(hre);

  logDebug("(setting deployment logic): ", deploymentLogic);

  const vaultFactory = FluidVaultFactory__factory.connect(
    (await hre.deployments.get("VaultFactory")).address,
    deployer
  );
  const populatedTx = await vaultFactory.populateTransaction.setVaultDeploymentLogic(deploymentLogic, true);

  TxQueue.queue(
    populatedTx,
    JSON.stringify(FluidVaultFactory__factory.abi),
    vaultFactory.address,
    FluidVaultFactory__factory.createInterface().getFunction("setVaultDeploymentLogic").format(),
    {
      deploymentLogic_: deploymentLogic,
      allowed_: true,
    }
  );
};
