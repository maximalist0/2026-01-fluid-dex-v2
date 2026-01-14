import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FluidVersion } from "../../../settings";
import { L2_SEQUENCER_UPTIME_FEED } from "../../../settings/contract-addresses";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployGenericCenterPrice = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  name: string,
  isL2: boolean,
  constructorArgs: any
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    name,
    isL2,
    constructorArgs
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, boolean, any]
) => {
  const name: string = args[0];
  const isL2: boolean = args[1];
  let constructorArgs = args[2];

  let contractPath = "contracts/oracle/centerPrices/genericCenterPrice.sol:FluidGenericCenterPrice";
  if (isL2) {
    constructorArgs = [...constructorArgs, L2_SEQUENCER_UPTIME_FEED(hre.network.name)];
    contractPath = "contracts/oracle/centerPrices/genericCenterPriceL2.sol:FluidGenericCenterPriceL2";
  }

  const deployedAddress = await deploy(hre, name, contractPath, version, constructorArgs, undefined, true);
  return deployedAddress;
};
