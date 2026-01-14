import { BigNumber, constants } from "ethers";

import { MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { TOKENS_ARBITRUM, NATIVE_TOKEN } from "../token-addresses";
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

const TOKEN = TOKENS_ARBITRUM.WETH.address;
const DECIMALS = TOKENS_ARBITRUM.WETH.decimals; // count of decimals
const DECIMALS_MULTIPLIER = BigNumber.from(10).pow(DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

// wrapped token should not exist at Liquidity
const LIQUIDITY_RATE_DATA = null as any;
const LIQUIDITY_TOKEN_CONFIG = null as any;

//#region IF IS NATIVE
// BELOW CONFIG FOR STETH PROTOCOL IS ONLY NEEDED FOR NATIVE TOKEN (ETH) AS IT BORROWS ETH
const STETH_BORROW_CONFIG = null as any;
//#endregion

//#region IF NOT NATIVE
// BELOW CONFIG FOR iTOKEN NOT NEEDED FOR LISTING NATIVE TOKEN (is part of wrapped native token listing instead).

// rebalancer likely stays the same on all fTokens. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const IS_FTOKEN_NATIVE = true; // set to true if the listing token is WETH (WMATIC) etc.

const FTOKEN_SUPPLY_CONFIG = (fTokenAddress: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  // NOTE THAT SPECIAL CASE IF IS_FTOKEN_NATIVE == TRUE THEN THIS CONFIG HERE IS FOR NATIVE TOKEN, not for "TOKEN" (TOKEN is wrapped native).
  // BECAUSE DEPOSIT AT LIQUIDITY IS ALWAYS IN NATIVE THEN. (wrapped is unwrapped for deposits)
  baseWithdrawalLimit: DECIMALS_MULTIPLIER.mul(2_350), // 2_350 ETH = ~7.5M USD @ 1ETH = 3200
  expandDuration: 60 * 60 * 12, // 12hrs in seconds.
  expandPercent: 20 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: TOKEN, // SHOULD NOT CHANGE. NOTE: if IS_FTOKEN_NATIVE == true this is automatically set to native token address, no need to change here.
  user: fTokenAddress, // SHOULD NOT CHANGE
});

// set to null to skip automated withdrawal limit expandPercentages on ExpandPercentConfigHandler:
const FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS = null as any;

// set to null to skip LendingRewardsRateModel:
const LENDING_REWARDS_RATE_MODEL = null as any;

// set to null to skip INST StakingRewards (rewards in INST):
const STAKING_REWARDS = (fTokenAddress: string) => null as any;
// const STAKING_REWARDS = (fTokenAddress: string) => ({
//   duration: 60 * 60 * 24 * 90, // 3 months
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
