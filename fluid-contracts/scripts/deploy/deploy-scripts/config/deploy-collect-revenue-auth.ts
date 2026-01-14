import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployCollectRevenueAuth = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const liquidity = (await hre.deployments.get("Liquidity")).address;
  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;

  const name = "CollectRevenueAuth";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/collectRevenueAuth/main.sol:FluidCollectRevenueAuth",
    version,
    // constructor args:
    // address liquidity_,
    // address reserveContract_
    [liquidity, reserveContract]
  );
  return deployedAddress;
};
