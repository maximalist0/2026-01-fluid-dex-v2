import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";
import { Structs as ExpandPercentConfigHandlerStructs } from "../../../../typechain-types/contracts/config/expandPercentHandler/main.sol/FluidExpandPercentConfigHandler";
import { throwIfAddressZero } from "../../../util";

export const deployExpandPercentConfigHandler = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  protocol: string,
  withdrawToken: string,
  borrowToken: string,
  withdrawCheckPoints: ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct | null,
  borrowCheckPoints: ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct | null,
  protocolName: string // e.g. fToken_fUSDC or Vault_ETH_USDC;
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  if (!withdrawCheckPoints) {
    withdrawCheckPoints = {
      tvlCheckPoint1: 0,
      expandPercentUntilCheckPoint1: 0,
      tvlCheckPoint2: 0,
      expandPercentUntilCheckPoint2: 0,
      tvlCheckPoint3: 0,
      expandPercentUntilCheckPoint3: 0,
      expandPercentAboveCheckPoint3: 0,
    } as ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct;
  }

  if (!borrowCheckPoints) {
    borrowCheckPoints = {
      tvlCheckPoint1: 0,
      expandPercentUntilCheckPoint1: 0,
      tvlCheckPoint2: 0,
      expandPercentUntilCheckPoint2: 0,
      tvlCheckPoint3: 0,
      expandPercentUntilCheckPoint3: 0,
      expandPercentAboveCheckPoint3: 0,
    } as ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct;
  }

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    protocol,
    withdrawToken,
    borrowToken,
    withdrawCheckPoints,
    borrowCheckPoints,
    protocolName
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [
    string,
    string,
    string,
    ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct,
    ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct,
    string
  ]
) => {
  const protocol = throwIfAddressZero(args[0], "Liquidity Config Handler protocol");
  const withdrawToken = args[1];
  const borrowToken = args[2];
  const withdrawCheckPoints = args[3];
  const borrowCheckPoints = args[4];
  const protocolName = args[5];

  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;
  const liquidity = (await hre.deployments.get("Liquidity")).address;

  const name = protocolName + "_ExpandPercentConfigHandler";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/expandPercentHandler/main.sol:FluidExpandPercentConfigHandler",
    version,
    // constructor args:
    // IFluidReserveContract reserveContract_,
    // IFluidLiquidity liquidity_,
    // address protocol_,
    // address withdrawToken_, // can be unused in some cases (e.g. StETH)
    // address borrowToken_, // can be unused in some cases (e.g. Lending)
    // LimitCheckPoints memory withdrawCheckPoints_, // can be skipped if withdrawToken is not set.
    // LimitCheckPoints memory borrowCheckPoints_ // can be skipped if borrowToken_ is not set.
    [reserveContract, liquidity, protocol, withdrawToken, borrowToken, withdrawCheckPoints, borrowCheckPoints]
  );
  return deployedAddress;
};
