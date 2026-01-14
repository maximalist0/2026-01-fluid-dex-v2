import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deploySSTORE2Deployer = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployedAddress = await deploy(
    hre,
    "SStore2Deployer",
    "contracts/protocols/dex/factory/deploymentHelpers/SSTORE2Deployer.sol:SStore2Deployer",
    version,
    []
  );
  return deployedAddress;
};
