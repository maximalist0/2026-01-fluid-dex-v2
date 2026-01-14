import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployDexLiteResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes dexLite contract and deployer contract
  const dexLite = await hre.deployments.get("FluidDexLite");
  const liquidity = await hre.deployments.get("Liquidity");
  const deployerContract = await hre.deployments.get("DeployerFactory");

  const deployedAddress = await deploy(
    hre,
    "FluidDexLiteResolver",
    "contracts/periphery/resolvers/dexLite/main.sol:FluidDexLiteResolver",
    version,
    [dexLite.address, liquidity.address, deployerContract.address]
  );
  return deployedAddress;
};