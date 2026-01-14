import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployLiquidityProxy = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes admin address (deployer) and dummy impl

  // set dummy impl to empty address for starting as constructor args to not affect proxy address for multi-chain etc.
  const emptyImplementation = await hre.deployments.get("EmptyImplementation");

  const governance = throwIfAddressZero(coreContractsConfig().liquidity.governance, "Liquidity governance");

  const deployedAddress = await deploy(hre, "Liquidity", "contracts/liquidity/proxy.sol:FluidLiquidityProxy", version, [
    governance,
    emptyImplementation.address, // initial dummy impl
  ]);
  return deployedAddress;
};
