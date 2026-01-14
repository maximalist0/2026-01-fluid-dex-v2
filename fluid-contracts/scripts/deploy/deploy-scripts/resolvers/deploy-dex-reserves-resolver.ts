import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployDexReservesResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes dex factory and liquidity layer
  const dexFactory = await hre.deployments.get("DexFactory");
  const liquidity = await hre.deployments.get("Liquidity");
  const liquidityResolver = await hre.deployments.get("LiquidityResolver");

  const deployedAddress = await deploy(
    hre,
    "DexReservesResolver",
    "contracts/periphery/resolvers/dexReserves/main.sol:FluidDexReservesResolver",
    version,
    [dexFactory.address, liquidity.address, liquidityResolver.address]
  );
  return deployedAddress;
};
