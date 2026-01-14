import { BigNumber, constants } from "ethers";

import { MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { TOKENS_MAINNET } from "../token-addresses";
import { AVOCADO_TEAM_MULTISIG, RESERVE_CONTRACT } from "../contract-addresses";
import { GOVERNANCE, PROD_GOVERNANCE_TIMELOCK } from "../core-configs/core-configs";
import { Structs as ExpandPercentConfigHandlerStructs } from "../../../typechain-types/contracts/config/expandPercentHandler/main.sol/FluidExpandPercentConfigHandler";

// ----------------------------------------------------------
//
//    @dev FOR LISTING A TOKEN, MUST CONFIGURE VARIABLES BELOW:
//
//  !! PAY ATTENTION TO DIFFERENT REGIONS DEPENDING ON LISTING NATIVE, WRAPPED NATIVE, OR NORMAL ERC20 !!
//
// ----------------------------------------------------------

const TOKEN = TOKENS_MAINNET.USDC.address; // USDC on Mainnet
const DECIMALS = TOKENS_MAINNET.USDC.decimals; // count of decimals
const DECIMALS_MULTIPLIER = BigNumber.from(10).pow(DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const LIQUIDITY_RATE_DATA: AdminModuleStructs.RateDataV1ParamsStruct | AdminModuleStructs.RateDataV2ParamsStruct = {
  kink1: 80 * PERCENT_PRECISION,
  kink2: 93 * PERCENT_PRECISION,
  rateAtUtilizationZero: 0 * PERCENT_PRECISION,
  rateAtUtilizationKink1: 5 * PERCENT_PRECISION,
  rateAtUtilizationKink2: 7 * PERCENT_PRECISION,
  rateAtUtilizationMax: 20 * PERCENT_PRECISION,
  token: TOKEN,
} as AdminModuleStructs.RateDataV2ParamsStruct;
const LIQUIDITY_TOKEN_CONFIG: AdminModuleStructs.TokenConfigStruct = {
  fee: 10 * PERCENT_PRECISION, // 10% fee
  threshold: 0.3 * PERCENT_PRECISION, // update storage at >0.3% changes in utilization
  token: TOKEN,
  maxUtilization: 1e4, // 100%
};

//#region IF IS NATIVE
// BELOW CONFIG FOR STETH PROTOCOL IS ONLY NEEDED FOR NATIVE TOKEN (ETH) AS IT BORROWS ETH
const STETH_BORROW_CONFIG = null as any;
//#endregion

//#region IF NOT NATIVE
// BELOW CONFIG FOR iTOKEN NOT NEEDED FOR LISTING NATIVE TOKEN (is part of wrapped native token listing instead).

// rebalancer likely stays the same on all fTokens. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const IS_FTOKEN_NATIVE = false; // set to true if the listing token is WETH (WMATIC) etc.

const FTOKEN_SUPPLY_CONFIG = (fTokenAddress: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  // NOTE THAT SPECIAL CASE IF IS_FTOKEN_NATIVE == TRUE THEN THIS CONFIG HERE IS FOR NATIVE TOKEN, not for "TOKEN" (TOKEN is wrapped native).
  // BECAUSE DEPOSIT AT LIQUIDITY IS ALWAYS IN NATIVE THEN. (wrapped is unwrapped for deposits)
  baseWithdrawalLimit: DECIMALS_MULTIPLIER.mul(7_500_000), // 7.5M USDC
  expandDuration: 60 * 60 * 12, // 12hrs in seconds.
  expandPercent: 25 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: TOKEN, // SHOULD NOT CHANGE. NOTE: if IS_FTOKEN_NATIVE == true this is automatically set to native token address, no need to change here.
  user: fTokenAddress, // SHOULD NOT CHANGE
});

// set to null to skip automated withdrawal limit expandPercentages on ExpandPercentConfigHandler:
// const FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS = null as any;
const FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS: ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct = {
  // all expandPercent values in 1e2. tvlCheckPoint values in supply token decimals.
  tvlCheckPoint1: DECIMALS_MULTIPLIER.mul(20_000_000), // e.g. 20M
  expandPercentUntilCheckPoint1: 25 * PERCENT_PRECISION, // e.g. 25%
  tvlCheckPoint2: DECIMALS_MULTIPLIER.mul(30_000_000), // e.g. 30M
  expandPercentUntilCheckPoint2: 20 * PERCENT_PRECISION, // e.g. 20%
  tvlCheckPoint3: DECIMALS_MULTIPLIER.mul(40_000_000), // e.g. 40M
  expandPercentUntilCheckPoint3: 15 * PERCENT_PRECISION, // e.g. 15%
  expandPercentAboveCheckPoint3: 10 * PERCENT_PRECISION, // e.g. 10%
};

// set to null to skip LendingRewardsRateModel:
// const LENDING_REWARDS_RATE_MODEL = null as any;

const LENDING_REWARDS_RATE_MODEL = {
  duration: 60 * 60 * 24 * 90, // 90 days
  startTvl: DECIMALS_MULTIPLIER.mul(1_000), // start at 1000 USDC
  rewardAmount: DECIMALS_MULTIPLIER.mul(750_000), //
  startTime: Math.floor(Date.now() / 1000) + 86400, // current time in seconds + 1 day
  configurator: AVOCADO_TEAM_MULTISIG,
  fToken1: "0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33", // fUSDC
  fToken2: "0x5C20B550819128074FD538Edf79791733ccEdd18", // fUSDT
  fToken3: "",
};

// set to null to skip INST StakingRewards (rewards in INST):
// const STAKING_REWARDS = (fTokenAddress: string) => null as any;
const STAKING_REWARDS = (fTokenAddress: string) => ({
  duration: 60 * 60 * 24 * 90, // 3 months
  owner: GOVERNANCE, // likely should not change
  //
  rewardsToken: TOKENS_MAINNET.INST.address, // INST on mainnet. SHOULD NOT CHANGE
  stakingToken: fTokenAddress, // SHOULD NOT CHANGE
});
//#endregion

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const listTokenConfigs = () => ({
  token: TOKEN,
  decimals: DECIMALS,
  liquidity: {
    rateData: LIQUIDITY_RATE_DATA,
    tokenConfig: LIQUIDITY_TOKEN_CONFIG,
  },
  lending: {
    // not needed when listing native ETH
    isNativeUnderlying: IS_FTOKEN_NATIVE,
    lendingRewardsRateModel: LENDING_REWARDS_RATE_MODEL,
    stakingRewards: STAKING_REWARDS,
    fToken: {
      supplyConfig: FTOKEN_SUPPLY_CONFIG,
      rebalancer: REBALANCER,
      configHandler: {
        withdrawLimitCheckpoints: FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS,
      },
    },
  },
  steth: {
    borrowConfig: STETH_BORROW_CONFIG, // only needed when listing native ETH
  },
});
//#endregion
