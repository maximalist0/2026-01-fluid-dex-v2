import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployLimitsAuth = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const name = "LimitsAuth";

  const liquidity = (await hre.deployments.get("Liquidity")).address;

  const deployedAddress = await deploy(hre, name, "contracts/config/limitsAuth/main.sol:FluidLimitsAuth", version, [
    liquidity,
  ]);
  return deployedAddress;
};
