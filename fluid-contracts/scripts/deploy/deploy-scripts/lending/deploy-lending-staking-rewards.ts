import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";
import { getTokenSymbol, throwIfAddressZero } from "../../../util";

export const deployLendingStakingRewards = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  fTokenAsset: string,
  owner: string,
  rewardsToken: string,
  stakingToken: string,
  rewardsDuration: number
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    fTokenAsset,
    owner,
    rewardsToken,
    stakingToken,
    rewardsDuration
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, string, string, number]
) => {
  const fTokenAsset = throwIfAddressZero(args[0], "StakingRewards fToken asset");
  const owner = throwIfAddressZero(args[1], "StakingRewards owner");
  const rewardsToken = throwIfAddressZero(args[2], "StakingRewards rewardsToken");
  const stakingToken = throwIfAddressZero(args[3], "StakingRewards stakingToken");
  const rewardsDuration = args[4];

  const name = "fToken_f" + (await getTokenSymbol(hre, fTokenAsset)) + "_StakingRewards";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/protocols/lending/stakingRewards/main.sol:FluidLendingStakingRewards",
    version,
    // constructor args: address _owner, IERC20 _rewardsToken, IERC20 _stakingToken, uint256 _rewardsDuration
    [owner, rewardsToken, stakingToken, rewardsDuration]
  );
  return deployedAddress;
};
