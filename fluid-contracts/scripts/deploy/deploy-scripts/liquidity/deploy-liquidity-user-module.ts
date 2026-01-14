import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployLiquidityUserModule = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  let path = "contracts/liquidity/userModule/mainMainnet.sol:FluidLiquidityUserModuleMainnet";
  if (hre.network.name != "mainnet") {
    path = "contracts/liquidity/userModule/mainOthers.sol:FluidLiquidityUserModuleOthers";
  }

  const deployedAddress = await deploy(hre, "UserModule", path, version, []);
  return deployedAddress;
};
