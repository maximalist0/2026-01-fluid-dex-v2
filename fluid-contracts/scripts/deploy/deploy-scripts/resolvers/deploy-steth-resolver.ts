import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployStETHResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes stEthQueue (Proxy), liquidity resolver
  const stETHQueueProxy = await hre.deployments.get("StETHQueueProxy");
  const liquidityResolver = await hre.deployments.get("LiquidityResolver");

  const lidoWithdrawalQueue = throwIfAddressZero(
    coreContractsConfig().steth.lidoWithdrawalQueue,
    "StETH lidoWithdrawalQueue"
  );

  const deployedAddress = await deploy(
    hre,
    "StETHResolver",
    "contracts/periphery/resolvers/steth/main.sol:FluidStETHResolver",
    version,
    [stETHQueueProxy.address, liquidityResolver.address, lidoWithdrawalQueue]
  );
  return deployedAddress;
};
