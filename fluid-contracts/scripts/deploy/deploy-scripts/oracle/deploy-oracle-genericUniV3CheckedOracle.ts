import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployOracleGenericUniV3CheckedOracle = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  name: string,
  constructorArgs: any
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, name, constructorArgs);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion, args: [string, any]) => {
  const name: string = args[0];
  const constructorArgs = args[1];

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/oracle/oracles/genericUniV3CheckedOracle.sol:FluidGenericUniV3CheckedOracle",
    version,
    constructorArgs,
    undefined,
    true // through deployer factory
  );
  return deployedAddress;
};
