import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployDeployerFactory = async (hre: HardhatRuntimeEnvironment, version: FluidVersion, owner: string) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, owner);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion, args: [string]) => {
  const owner = throwIfAddressZero(args[0], "Deployer factory owner");

  // constructor args:
  // address owner_
  const deployedAddress = await deploy(
    hre,
    "DeployerFactory",
    "contracts/deployer/main.sol:FluidContractFactory",
    version,
    [owner]
  );
  return deployedAddress;
};
