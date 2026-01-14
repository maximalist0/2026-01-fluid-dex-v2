import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { L2_SEQUENCER_UPTIME_FEED } from "../../../settings/contract-addresses";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployChainlinkCenterPriceL2 = async (
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
  let constructorArgs = args[1];

  constructorArgs = [...constructorArgs, L2_SEQUENCER_UPTIME_FEED(hre.network.name)];

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/oracle/centerPrices/chainlinkCenterPriceL2.sol:ChainlinkCenterPriceL2",
    version,
    constructorArgs,
    undefined,
    true // through deployer factory
  );
  return deployedAddress;
};
