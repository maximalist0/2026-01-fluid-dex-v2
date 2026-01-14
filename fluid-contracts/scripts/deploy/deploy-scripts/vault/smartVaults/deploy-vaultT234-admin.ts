import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion, getVaultTypeName, getVaultTypePath, VAULT_TYPE } from "../../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../../util";

export const deployVaultT234Admin = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  vaultType: VAULT_TYPE
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, vaultType);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion, args: [VAULT_TYPE]) => {
  const vaultType = args[0];

  const name = `${getVaultTypeName(vaultType)}Admin`;
  const path = `${getVaultTypePath(vaultType)}adminModule/main.sol:Fluid${name}`;

  const deployedAddress = await deploy(hre, name, path, version, []);
  return deployedAddress;
};
