import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber, constants } from "ethers";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";
import { deployerSigner, getTokenSymbol, throwIfAddressZero } from "../../../util";
import { IERC20Metadata__factory } from "../../../../typechain-types";

export const deployLendingRewardsRateModel = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  fToken1: string,
  fToken2: string,
  fToken3: string,
  startTvl: BigNumber,
  duration: number,
  rewardAmount: BigNumber,
  startTime: number,
  configurator: string
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    fToken1,
    fToken2,
    fToken3,
    startTvl,
    duration,
    rewardAmount,
    startTime,
    configurator
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, string, BigNumber, number, BigNumber, number, string]
) => {
  const fToken1 = throwIfAddressZero(args[0], "LendingRewardsRateModel fToken1");
  const fToken2 = args[1] || constants.AddressZero;
  const fToken3 = args[2] || constants.AddressZero;
  const startTvl = args[3];
  const duration = args[4];
  const rewardAmount = args[5];
  const startTime = args[6];
  const configurator = throwIfAddressZero(args[7], "LendingRewardsRateModel configurator");

  const deployer = await deployerSigner(hre);

  let name = await IERC20Metadata__factory.connect(fToken1, deployer).symbol();

  if (!!fToken2 && fToken2 != constants.AddressZero) {
    name += "_" + (await IERC20Metadata__factory.connect(fToken2, deployer).symbol());
  }
  if (!!fToken3 && fToken3 != constants.AddressZero) {
    name += "_" + (await IERC20Metadata__factory.connect(fToken3, deployer).symbol());
  }

  name += "_Rewards";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/protocols/lending/lendingRewardsRateModel/main.sol:FluidLendingRewardsRateModel",
    version,
    // constructor args:
    /// @notice Sets variables for rewards rate configuration based on input parameters.
    /// @param configurator_ The address with authority to configure rewards.
    /// @param fToken_ The address of the associated fToken contract.
    /// @param fToken2_ The address of the associated fToken contract 2, optional.
    /// @param fToken3_ The address of the associated fToken contract 3, optional.
    /// @param startTvl_ The TVL threshold below which the reward rate is 0.
    /// @param rewardAmount_ The total amount of underlying assets to be distributed as rewards.
    /// @param duration_ The duration (in seconds) for which the rewards will run.
    /// @param startTime_ The timestamp when rewards are scheduled to start; must be 0 or a future time.
    [configurator, fToken1, fToken2, fToken3, startTvl, rewardAmount, duration, startTime]
  );

  return deployedAddress;
};
