import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deploySmartLendingResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const smartLendingFactory = await hre.deployments.get("SmartLendingFactory");
  const dexResolver = await hre.deployments.get("DexResolver");

  const deployedAddress = await deploy(
    hre,
    "SmartLendingResolver",
    "contracts/periphery/resolvers/smartLending/main.sol:FluidSmartLendingResolver",
    version,
    [dexResolver.address, smartLendingFactory.address]
  );
  return deployedAddress;
};
