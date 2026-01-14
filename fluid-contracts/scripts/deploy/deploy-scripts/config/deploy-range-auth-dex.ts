import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployRangeAuthDex = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const name = "RangeAuthDex";

  let weETHDex = hre.ethers.constants.AddressZero;
  let wstETHDex = hre.ethers.constants.AddressZero;

  if (hre.network.name === "mainnet") {
    weETHDex = "0x86f874212335Af27C41cDb855C2255543d1499cE";
    wstETHDex = "0x0B1a513ee24972DAEf112bC777a5610d4325C9e7";
  }

  const deployedAddress = await deploy(hre, name, "contracts/config/rangeAuthDex/main.sol:FluidRangeAuthDex", version, [
    wstETHDex,
    weETHDex,
  ]);
  return deployedAddress;
};
