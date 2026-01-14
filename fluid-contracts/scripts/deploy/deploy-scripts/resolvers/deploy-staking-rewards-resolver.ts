import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployStakingRewardsResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes LendingResolver address
  const lendingResolver = await hre.deployments.get("LendingResolver");

  const deployedAddress = await deploy(
    hre,
    "StakingRewardsResolver",
    "contracts/periphery/resolvers/stakingRewards/main.sol:FluidStakingRewardsResolver",
    version,
    [lendingResolver.address]
  );
  return deployedAddress;
};
