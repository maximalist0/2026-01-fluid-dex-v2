import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployOracleStaticOracle = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  name: string,
  infoName: string,
  staticPrice: string,
  liquidateZero: boolean
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, name, [
    infoName,
    staticPrice,
    liquidateZero,
  ]);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion, args: [string, any]) => {
  const name: string = args[0];
  const constructorArgs = args[1];

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/oracle/oracles/staticOracle.sol:StaticNoBorrowOracle",
    version,
    constructorArgs,
    undefined,
    true // through deployer factory
  );
  return deployedAddress;
};
