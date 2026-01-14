import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess } from "../../util";
import { FluidVersion } from "../../settings";
import { deployLendingFactory, deployLendingResolver, deployStakingRewardsResolver } from "../deploy-scripts";

export const deployLending = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n----------------------------------------- LENDING PROTOCOL -------------------\n");

  // Note LendingFactory is deployed via branch "new-chain-deploy-core-frozen"

  // deploy LendingResolver
  await deployLendingResolver(hre, version);

  // deploy StakingRewardsResolver
  await deployStakingRewardsResolver(hre, version);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "Lending protocol deployment!\n")
  );
};
