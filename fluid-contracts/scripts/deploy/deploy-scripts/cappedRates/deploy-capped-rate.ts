import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";
import { FluidCappedRateBase } from "../../../../typechain-types/contracts/oracle/cappedRates/erc4626CappedRate.sol/FluidERC4626CappedRate";
import { L2_SEQUENCER_UPTIME_FEED } from "../../../settings/contract-addresses";

export const getFluidCappedRateName = (
  fullyQualifiedPath: string,
  tokenSymbol: string,
  params: FluidCappedRateBase.CappedRateConstructorParamsStruct
) => {
  return `CappedRate${fullyQualifiedPath.split(":")[1].replace("Fluid", "").replace("CappedRate", "")}_${tokenSymbol}${
    params.invertCenterPrice ? "_CenterPriceInverted" : ""
  }`;
};

export const deployCappedRate = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  tokenSymbol: string, // E.g. WUSDM or MATICX
  fullyQualifiedPath: string, // e.g. "contracts/oracle/cappedRates/balancerCappedRate.sol:FluidBalancerCappedRate",
  params: FluidCappedRateBase.CappedRateConstructorParamsStruct,
  rateSource2?: string
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    tokenSymbol,
    fullyQualifiedPath,
    params,
    rateSource2
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, FluidCappedRateBase.CappedRateConstructorParamsStruct, string?]
) => {
  const tokenSymbol: string = args[0];
  const fullyQualifiedPath: string = args[1];
  const params: FluidCappedRateBase.CappedRateConstructorParamsStruct = args[2];
  const rateSource2 = args[3];

  let constructorArgs = !!rateSource2 ? [params, rateSource2] : [params];

  if (fullyQualifiedPath?.includes("CappedRateL2")) {
    constructorArgs = [...constructorArgs, L2_SEQUENCER_UPTIME_FEED(hre.network.name)];
  }

  const deployedAddress = await deploy(
    hre,
    getFluidCappedRateName(fullyQualifiedPath, tokenSymbol, params),
    fullyQualifiedPath,
    version,
    // constructor args: CappedRateConstructorParams
    constructorArgs,
    undefined,
    true // through deployer factory
  );
  return deployedAddress;
};
