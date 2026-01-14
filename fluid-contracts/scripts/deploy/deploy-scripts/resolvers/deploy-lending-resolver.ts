import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployLendingResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes lending factory address
  const lendingFactory = await hre.deployments.get("LendingFactory");
  const liquidityResolver = await hre.deployments.get("LiquidityResolver");

  const deployedAddress = await deploy(
    hre,
    "LendingResolver",
    "contracts/periphery/resolvers/lending/main.sol:FluidLendingResolver",
    version,
    [lendingFactory.address, liquidityResolver.address]
  );
  return deployedAddress;
};
