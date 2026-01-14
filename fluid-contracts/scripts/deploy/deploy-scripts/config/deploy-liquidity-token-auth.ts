import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployLiquidityTokenAuth = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const liquidity = (await hre.deployments.get("Liquidity")).address;
  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;

  const name = "LiquidityTokenAuth";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/liquidityTokenAuth/main.sol:FluidLiquidityTokenAuth",
    version,
    // constructor args:
    // address liquidity_, IFluidReserveContract reserveContract_
    [liquidity, reserveContract]
  );
  return deployedAddress;
};
