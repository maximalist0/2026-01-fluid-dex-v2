import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../../util";

export const deployVaultT234Secondary = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const name = `VaultSecondary`;
  const path = `contracts/protocols/vault/vaultTypesCommon/coreModule/main2.sol:FluidVaultSecondary`;

  const deployedAddress = await deploy(hre, name, path, version, []);
  return deployedAddress;
};
