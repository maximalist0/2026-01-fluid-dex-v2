import { BigNumber, constants } from "ethers";

import { MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { TOKENS_PLASMA } from "../token-addresses";
import { RESERVE_CONTRACT } from "../contract-addresses";
import { GOVERNANCE } from "../core-configs/core-configs";

// ----------------------------------------------------------
//
//    @dev FOR LISTING A TOKEN, MUST CONFIGURE VARIABLES BELOW:
//
//  !! PAY ATTENTION TO DIFFERENT REGIONS DEPENDING ON LISTING NATIVE, WRAPPED NATIVE, OR NORMAL ERC20 !!
//
// ----------------------------------------------------------

const TOKEN = TOKENS_PLASMA.GHO.address;
const DECIMALS = TOKENS_PLASMA.GHO.decimals; // count of decimals
const DECIMALS_MULTIPLIER = BigNumber.from(10).pow(DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const LIQUIDITY_RATE_DATA: AdminModuleStructs.RateDataV1ParamsStruct | AdminModuleStructs.RateDataV2ParamsStruct = {
  kink1: 80 * PERCENT_PRECISION,
  kink2: 90 * PERCENT_PRECISION,
  rateAtUtilizationZero: 0 * PERCENT_PRECISION,
  rateAtUtilizationKink1: Math.round(4.5 * PERCENT_PRECISION),
  rateAtUtilizationKink2: Math.round(6.5 * PERCENT_PRECISION),
  rateAtUtilizationMax: 40 * PERCENT_PRECISION,
  token: TOKEN,
} as AdminModuleStructs.RateDataV2ParamsStruct;

const LIQUIDITY_TOKEN_CONFIG: AdminModuleStructs.TokenConfigStruct = {
  fee: 10 * PERCENT_PRECISION, // 10% fee
  threshold: 0.1 * PERCENT_PRECISION, // update storage at >0.1% changes in utilization
  token: TOKEN,
  maxUtilization: 1e4, // 100%
};

// rebalancer likely stays the same on all fTokens. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const IS_FTOKEN_NATIVE = false; // set to true if the listing token is WETH (WMATIC) etc.

const FTOKEN_SUPPLY_CONFIG = (fTokenAddress: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  // NOTE THAT SPECIAL CASE IF IS_FTOKEN_NATIVE == TRUE THEN THIS CONFIG HERE IS FOR NATIVE TOKEN, not for "TOKEN" (TOKEN is wrapped native).
  // BECAUSE DEPOSIT AT LIQUIDITY IS ALWAYS IN NATIVE THEN. (wrapped is unwrapped for deposits)
  baseWithdrawalLimit: DECIMALS_MULTIPLIER.mul(7_500_000), // 7.5M GHO
  expandDuration: 60 * 60 * 6, // 6hrs in seconds.
  expandPercent: 50 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: TOKEN, // SHOULD NOT CHANGE. NOTE: if IS_FTOKEN_NATIVE == true this is automatically set to native token address, no need to change here.
  user: fTokenAddress, // SHOULD NOT CHANGE
});

// set to null to skip LendingRewardsRateModel:
const LENDING_REWARDS_RATE_MODEL = null;

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
    fToken: {
      supplyConfig: FTOKEN_SUPPLY_CONFIG,
      rebalancer: REBALANCER,
    },
  },
});
//#endregion
