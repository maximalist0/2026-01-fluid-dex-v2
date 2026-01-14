import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployVaultT1DeploymentLogic = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor args:
  // address liquidity_, address vaultAdminImplementation_, address vaultSecondaryImplementation_
  const liquidity = await hre.deployments.get("Liquidity");
  const vaultT1Admin = await hre.deployments.get("VaultT1Admin");
  const vaultT1Secondary = await hre.deployments.get("VaultT1Secondary");

  const deployedAddress = await deploy(
    hre,
    "VaultT1DeploymentLogic",
    "contracts/protocols/vault/factory/deploymentLogics/vaultT1Logic.sol:FluidVaultT1DeploymentLogic",
    version,
    [liquidity.address, vaultT1Admin.address, vaultT1Secondary.address]
  );

  return deployedAddress;
};
