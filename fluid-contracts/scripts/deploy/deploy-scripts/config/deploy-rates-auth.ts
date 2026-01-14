import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion, ratesAuthConfig } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployRatesAuth = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    ratesAuthConfig.percentRateChangeAllowed,
    ratesAuthConfig.cooldown
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [number, number]
) => {
  const percentRateChangeAllowed = args[0];
  const cooldown = args[1];

  const liquidity = (await hre.deployments.get("Liquidity")).address;

  const name = "RatesAuth";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/ratesAuth/main.sol:FluidRatesAuth",
    version,
    // constructor args:
    // address liquidity_,
    // uint256 percentRateChangeAllowed_
    // uint256 cooldown_
    [liquidity, percentRateChangeAllowed, cooldown]
  );
  return deployedAddress;
};
