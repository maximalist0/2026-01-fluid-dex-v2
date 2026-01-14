import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion, maxBorrowHandlerConfig } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployMaxBorrowConfigHandler = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    maxBorrowHandlerConfig.vault,
    maxBorrowHandlerConfig.borrowToken,
    maxBorrowHandlerConfig.maxUtilization,
    maxBorrowHandlerConfig.minUpdateDiff,
    maxBorrowHandlerConfig.protocolName
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, number, number, string]
) => {
  const vault = throwIfAddressZero(args[0], "Max borrow handler vault");
  const borrowToken = throwIfAddressZero(args[1], "Max borrow handler borrow token");
  const maxUtilization = args[2];
  const minUpdateDiff = args[3];
  const protocolName = args[4];

  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;
  const liquidity = (await hre.deployments.get("Liquidity")).address;
  const liquidityResolver = (await hre.deployments.get("LiquidityResolver")).address;

  const name = protocolName + "_MaxBorrowHandler";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/maxBorrowHandler/main.sol:FluidMaxBorrowConfigHandler",
    version,
    // constructor args:
    // IFluidReserveContract reserveContract_,
    // IFluidLiquidity liquidity_,
    // IFluidLiquidityResolver liquidityResolver_,
    // address protocol_,
    // address borrowToken_,
    // uint256 maxUtilization_,
    // uint256 minUpdateDiff_
    [reserveContract, liquidity, liquidityResolver, vault, borrowToken, maxUtilization, minUpdateDiff]
  );
  return deployedAddress;
};
