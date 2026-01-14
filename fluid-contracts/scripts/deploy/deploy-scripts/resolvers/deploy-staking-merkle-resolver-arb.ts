import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployStakingMerkleResolverArb = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployedAddress = await deploy(
    hre,
    "StakingMerkleResolver",
    "contracts/periphery/resolvers/stakingMerkle/mainArb.sol:FluidStakingMerkleResolver",
    version,
    []
  );
  return deployedAddress;
};
