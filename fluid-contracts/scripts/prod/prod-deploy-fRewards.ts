import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import { FluidVersion, listTokenConfigs } from "../settings";
import { logDebug, logSuccess } from "../util";
import { deployLendingRewardsRateModel } from "../deploy/deploy-scripts";

export const prodDeployfRewards = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID fTOKEN REWARDS -------------------\n");
  const version: FluidVersion = "v1_0_0";
  // check that token is not already configured.
  const config = listTokenConfigs();

  // deploy lendingRewardsRateModel for fToken
  let lendingRewardsRateModel;
  if (config.lending.lendingRewardsRateModel) {
    lendingRewardsRateModel = await deployLendingRewardsRateModel(
      hre,
      version,
      config.lending.lendingRewardsRateModel.fToken1,
      config.lending.lendingRewardsRateModel.fToken2,
      config.lending.lendingRewardsRateModel.fToken3,
      config.lending.lendingRewardsRateModel.startTvl,
      config.lending.lendingRewardsRateModel.duration,
      config.lending.lendingRewardsRateModel.rewardAmount,
      config.lending.lendingRewardsRateModel.startTime,
      config.lending.lendingRewardsRateModel.configurator
    );
  } else {
    logDebug("\nSkipped deploying a LendingRewardsRateModel, not configured.\n");
  }

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "deploy fToken rewards!\n")
  );
};
