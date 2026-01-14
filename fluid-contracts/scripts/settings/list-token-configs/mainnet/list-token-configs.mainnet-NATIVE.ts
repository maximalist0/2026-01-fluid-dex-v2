import { BigNumber } from "ethers";

import { DECIMALS_18, MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { NATIVE_TOKEN } from "../token-addresses";
import { RESERVE_CONTRACT } from "../contract-addresses";
import { GOVERNANCE } from "../core-configs/core-configs";
import { Structs as ExpandPercentConfigHandlerStructs } from "../../../typechain-types/contracts/config/expandPercentHandler/main.sol/FluidExpandPercentConfigHandler";

// ----------------------------------------------------------
//
//    @dev FOR LISTING A TOKEN, MUST CONFIGURE VARIABLES BELOW:
//
//  !! PAY ATTENTION TO DIFFERENT REGIONS DEPENDING ON LISTING NATIVE, WRAPPED NATIVE, OR NORMAL ERC20 !!
//
// ----------------------------------------------------------

const TOKEN = NATIVE_TOKEN.address;
const DECIMALS = NATIVE_TOKEN.decimals; // count of decimals
const DECIMALS_MULTIPLIER = BigNumber.from(10).pow(DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const LIQUIDITY_RATE_DATA: AdminModuleStructs.RateDataV1ParamsStruct | AdminModuleStructs.RateDataV2ParamsStruct = {
  kink1: 70 * PERCENT_PRECISION,
  kink2: 90 * PERCENT_PRECISION,
  rateAtUtilizationZero: 0 * PERCENT_PRECISION,
  rateAtUtilizationKink1: 2 * PERCENT_PRECISION,
  rateAtUtilizationKink2: (36 * PERCENT_PRECISION) / 10, // 3.6
  rateAtUtilizationMax: 100 * PERCENT_PRECISION,
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

const FTOKEN_SUPPLY_CONFIG = null as any;

// set to null to skip automated withdrawal limit expandPercentages on ExpandPercentConfigHandler:
const FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS = null as any;

// set to null to skip LendingRewardsRateModel:
const LENDING_REWARDS_RATE_MODEL = null as any;
// const LENDING_REWARDS_RATE_MODEL = {
//   duration: 60 * 60 * 24 * 90, // 3 months
//   startTvl: BigNumber.from(0),
//   rewardAmount: BigNumber.from(0),
//   initiator: GOVERNANCE,
// };

// set to null to skip INST StakingRewards (rewards in INST):
const STAKING_REWARDS = (fTokenAddress: string) => null as any;
// const STAKING_REWARDS = (fTokenAddress: string) => ({
//   duration: 60 * 60 * 24 * 7, // 7 days
//   owner: GOVERNANCE, // likely should not change
//   //
//   rewardsToken: TOKENS_MAINNET.INST.address, // INST on mainnet. SHOULD NOT CHANGE
//   stakingToken: fTokenAddress, // SHOULD NOT CHANGE
// });

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
