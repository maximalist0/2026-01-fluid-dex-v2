import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployVaultTicksBranchesResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes vault resolver
  const vaultResolver = await hre.deployments.get("VaultResolver");

  const deployedAddress = await deploy(
    hre,
    "VaultTicksBranchesResolver",
    "contracts/periphery/resolvers/vaultTicksBranches/main.sol:FluidVaultTicksBranchesResolver",
    version,
    [vaultResolver.address]
  );
  return deployedAddress;
};
