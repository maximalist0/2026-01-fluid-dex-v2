import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployLiquidityAdminModule = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const hardBorrowCap = coreContractsConfig().liquidity.nativeTokenMaxBorrowLimitHardCap(hre.network.name);

  if (hardBorrowCap.eq(0)) {
    throw new Error("Native token max borrow limit hard cap is 0!");
  }

  let path = "contracts/liquidity/adminModule/mainMainnet.sol:FluidLiquidityAdminModuleMainnet";
  if (hre.network.name != "mainnet") {
    path = "contracts/liquidity/adminModule/mainOthers.sol:FluidLiquidityAdminModuleOthers";
  }

  const deployedAddress = await deploy(hre, "AdminModule", path, version, [hardBorrowCap]);
  return deployedAddress;
};
