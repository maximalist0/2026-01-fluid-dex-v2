import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion, bufferRateHandlerConfig } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployBufferRateConfigHandler = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    bufferRateHandlerConfig.supplyToken,
    bufferRateHandlerConfig.borrowToken,
    bufferRateHandlerConfig.rateBufferKink1,
    bufferRateHandlerConfig.rateBufferKink2,
    bufferRateHandlerConfig.minUpdateDiff,
    bufferRateHandlerConfig.tokenPairSymbols
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, number, number, number, string]
) => {
  const supplyToken = throwIfAddressZero(args[0], "Buffer rate handler supply token");
  const borrowToken = throwIfAddressZero(args[1], "Buffer rate handler borrow token");
  const rateBufferKink1 = args[2];
  const rateBufferKink2 = args[3];
  const minUpdateDiff = args[4];
  const tokenPairSymbols = args[5];

  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;
  const liquidity = (await hre.deployments.get("Liquidity")).address;

  const name = "BufferRateHandler_" + tokenPairSymbols;

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/bufferRateHandler/main.sol:FluidBufferRateHandler",
    version,
    // constructor args:
    // IFluidReserveContract reserveContract_,
    // IFluidLiquidity liquidity_,
    // address supplyToken_,
    // address borrowToken_,
    // int256 rateBufferKink1_,
    // int256 rateBufferKink2_,
    // uint256 minUpdateDiff_
    [reserveContract, liquidity, supplyToken, borrowToken, rateBufferKink1, rateBufferKink2, minUpdateDiff]
  );
  return deployedAddress;
};
