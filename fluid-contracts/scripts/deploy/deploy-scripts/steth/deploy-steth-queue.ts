import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployStETHQueue = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const liquidity = await hre.deployments.get("Liquidity");

  const config = coreContractsConfig().steth;

  const stETHTokenAddress = throwIfAddressZero(config.steth, "StETH Token");
  const lidoWithdrawalQueue = throwIfAddressZero(config.lidoWithdrawalQueue, "StETH lidoWithdrawalQueue");

  const deployedAddress = await deploy(
    hre,
    "StETHQueue",
    "contracts/protocols/steth/main.sol:FluidStETHQueue",
    version,
    // constructor args: liquidity address, Lido withdrawal queue, steth erc20
    [liquidity.address, lidoWithdrawalQueue, stETHTokenAddress]
  );
  return deployedAddress;
};
