import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ethenaRateHandlerConfig, FluidVersion, TOKENS_MAINNET } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployEthenaRateConfigHandler = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    ethenaRateHandlerConfig.vault,
    ethenaRateHandlerConfig.vault2,
    ethenaRateHandlerConfig.borrowToken,
    ethenaRateHandlerConfig.ratePercentMargin,
    ethenaRateHandlerConfig.maxRewardsDelay,
    ethenaRateHandlerConfig.utilizationPenaltyStart,
    ethenaRateHandlerConfig.utilization100PenaltyPercent,
    ethenaRateHandlerConfig.protocolName
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, string, number, number, number, number, string]
) => {
  const vault = throwIfAddressZero(args[0], "Ethena rate handler vault");
  const vault2 = args[1];
  const borrowToken = throwIfAddressZero(args[2], "Ethena rate handler borrow token");
  const ratePercentMargin = args[3];
  const maxRewardsDelay = args[4];
  const utilizationPenaltyStart = args[5];
  const utilization100PenaltyPercent = args[6];
  const protocolName = args[7];

  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;
  const liquidity = (await hre.deployments.get("Liquidity")).address;
  const sUSDe = TOKENS_MAINNET.SUSDE.address;

  const name = protocolName + "_EthenaRateHandler";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/ethenaRateHandler/main.sol:FluidEthenaRateConfigHandler",
    version,
    // constructor args:
    //         IFluidReserveContract reserveContract_,
    //         IFluidLiquidity liquidity_,
    //         IFluidVaultT1 vault_,
    //         IFluidVaultT1 vault2_,
    //         IStakedUSDe stakedUSDe_,
    //         address borrowToken_,
    //         uint256 ratePercentMargin_,
    //         uint256 maxRewardsDelay_,
    //         uint256 utilizationPenaltyStart_,
    //         uint256 utilization100PenaltyPercent_
    [
      reserveContract,
      liquidity,
      vault,
      vault2,
      sUSDe,
      borrowToken,
      ratePercentMargin,
      maxRewardsDelay,
      utilizationPenaltyStart,
      utilization100PenaltyPercent,
    ]
  );
  return deployedAddress;
};
