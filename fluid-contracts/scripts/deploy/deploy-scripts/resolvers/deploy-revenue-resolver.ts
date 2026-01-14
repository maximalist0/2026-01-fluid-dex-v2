import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployRevenueResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes liquidity proxy address
  const liquidity = await hre.deployments.get("Liquidity");

  const deployedAddress = await deploy(
    hre,
    "RevenueResolver",
    "contracts/periphery/resolvers/revenue/main.sol:FluidRevenueResolver",
    version,
    [liquidity.address]
  );
  return deployedAddress;
};
