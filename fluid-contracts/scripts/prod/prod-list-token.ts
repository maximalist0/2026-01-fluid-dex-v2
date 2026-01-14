import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import { Structs as AdminModuleStructs } from "../../typechain-types/contracts/liquidity/adminModule/main.sol/AdminModule";
import { FluidVersion, listTokenConfigs, MODE_INTEREST_FREE } from "../settings";
import {
  deployerSigner,
  getLiquidityResolverWithSigner,
  getTokenSymbol,
  isLocalNetwork,
  logDebug,
  logSuccess,
  throwIfInvalidBorrowConfig,
  TxQueue,
} from "../util";
import {
  setConfigFTokenUpdateRebalancer,
  setConfigFTokenUpdateRewards,
  setConfigLiquidityAuths,
  setConfigLiquidityTokenConfig,
  setConfigLiquidityTokenRateV1,
  setConfigLiquidityTokenRateV2,
  setConfigLiquidityUserBorrowConfig,
  setConfigLiquidityUserSupplyConfig,
} from "../config";
import {
  deployLendingFToken,
  deployLendingRewardsRateModel,
  deployLendingStakingRewards,
  deployExpandPercentConfigHandler,
  FTokenType,
} from "../deploy/deploy-scripts";
import { NATIVE_TOKEN } from "../settings/token-addresses";
import { LIDO_WITHDRAWAL_QUEUE } from "../settings/contract-addresses";
import { constants } from "ethers";

export const prodListToken = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID LIST TOKEN -------------------\n");
  const version: FluidVersion = "v1_0_0";
  // check that token is not already configured.
  const config = listTokenConfigs();

  const liquidityResolver = await getLiquidityResolverWithSigner(hre, await deployerSigner(hre));
  if (config.lending?.isNativeUnderlying) {
    // do not configure Liquidity for WETH. should never exist at Liquidity.
    console.log("\nSkipped token listing at Liquidity, token is wrapped native!\n");
  } else if ((await liquidityResolver.getRateConfig(config.token)).isZero()) {
    // set rate config for underlying asset at Liquidity
    if ("kink2" in config.liquidity.rateData) {
      await setConfigLiquidityTokenRateV2(
        hre,
        config.liquidity.rateData as unknown as AdminModuleStructs.RateDataV2ParamsStruct
      );
    } else {
      await setConfigLiquidityTokenRateV1(
        hre,
        config.liquidity.rateData as unknown as AdminModuleStructs.RateDataV1ParamsStruct
      );
    }

    // set token config for underlying asset at Liquidity
    await setConfigLiquidityTokenConfig(hre, config.liquidity.tokenConfig);
  } else {
    console.log("\nToken already listed at Liquidity!\n");
  }

  // deploy fToken unless token is Native token
  if (config.token == NATIVE_TOKEN.address) {
    logDebug(
      "\nSkipped creating an fToken: native token does not have an fToken, wrappedNative gets the nativeUnderlying type.\n"
    );

    // if (
    //   hre.network.name === "mainnet" ||
    //   (isLocalNetwork(hre.network.name) && (await hre.ethers.provider.getCode(LIDO_WITHDRAWAL_QUEUE)) != "0x")
    // ) {
    //   const stETHProxy = (await hre.deployments.get("StETHQueueProxy")).address;
    //   // set user config for steth protocol at Liquidity. only borrows native ETH
    //   await setConfigLiquidityUserBorrowConfig(
    //     hre,
    //     throwIfInvalidBorrowConfig(config.steth.borrowConfig(stETHProxy), "StETH")
    //   );
    // }
  } else if (!config.lending?.fToken?.supplyConfig) {
    logDebug("\nSkipped creating an fToken: not configured.\n");
  } else if (config.lending?.fToken?.supplyConfig("").mode == MODE_INTEREST_FREE) {
    logDebug("\nSkipped creating an fToken: mode is interest free. fTokens do not support that currently.\n");
  } else {
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

    // deploy fToken
    let fTokenType = config.lending?.isNativeUnderlying ? FTokenType.NativeUnderlying : FTokenType.fToken;
    const fToken = await deployLendingFToken(hre, version, config.token, fTokenType);

    // token at liquidity is native token for fToken that has wrapped native as underlying
    const liquidityDepositToken = fTokenType == FTokenType.NativeUnderlying ? NATIVE_TOKEN.address : config.token;

    // set user config for fToken at Liquidity
    await setConfigLiquidityUserSupplyConfig(hre, {
      ...config.lending?.fToken.supplyConfig(fToken),
      token: liquidityDepositToken,
    });

    if (!!config.lending?.stakingRewards && config.lending?.stakingRewards(fToken)) {
      await deployLendingStakingRewards(
        hre,
        version,
        config.token,
        config.lending.stakingRewards(fToken).owner,
        config.lending.stakingRewards(fToken).rewardsToken,
        config.lending.stakingRewards(fToken).stakingToken,
        config.lending.stakingRewards(fToken).duration
      );
    } else {
      logDebug("\nSkipped deploying a StakingRewards contract, not configured.\n");
    }

    if (lendingRewardsRateModel) {
      // set lendingRewardsRateModel
      await setConfigFTokenUpdateRewards(hre, fToken, lendingRewardsRateModel);
    }

    let rebalancer = config.lending.fToken.rebalancer;
    if (rebalancer === hre.ethers.constants.AddressZero) {
      rebalancer = (await hre.deployments.get("ReserveContractProxy")).address;
    }
    if (rebalancer && rebalancer !== hre.ethers.constants.AddressZero) {
      // set rebalancer
      await setConfigFTokenUpdateRebalancer(hre, fToken, rebalancer);
    }
  }

  const tokenSymbol = await getTokenSymbol(hre, config.token);
  await TxQueue.processQueue(hre, "list-token-" + tokenSymbol);

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "list token!\n"));
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. Import the json file into Avocado transaction builder and execute.\n",
    "2. If first token listing: run this script with only step deployLendingFToken again (other steps commented out), to verify code at block explorer.\n",
    "3. Manually copy the transaction hash into the deployment logs for the fToken.\n",
    "4. Double check all configs!\n",
    "5. Every new fToken should be seeded with an initial deposit that is never withdrawn!\n"
  );
};
