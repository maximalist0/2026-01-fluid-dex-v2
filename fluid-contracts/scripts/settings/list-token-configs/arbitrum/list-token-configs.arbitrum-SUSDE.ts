import { PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { TOKENS_ARBITRUM } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR DEPLOYING AN FTOKEN, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

const IS_FTOKEN_NATIVE = false; // only true for WETH
const TOKEN = TOKENS_ARBITRUM.SUSDE.address;

const LIQUIDITY_RATE_DATA: AdminModuleStructs.RateDataV1ParamsStruct | AdminModuleStructs.RateDataV2ParamsStruct = {
  kink1: 50 * PERCENT_PRECISION,
  kink2: 80 * PERCENT_PRECISION,
  rateAtUtilizationZero: 0 * PERCENT_PRECISION,
  rateAtUtilizationKink1: 20 * PERCENT_PRECISION,
  rateAtUtilizationKink2: 40 * PERCENT_PRECISION,
  rateAtUtilizationMax: 100 * PERCENT_PRECISION,
  token: TOKEN,
} as AdminModuleStructs.RateDataV2ParamsStruct;

const LIQUIDITY_TOKEN_CONFIG: AdminModuleStructs.TokenConfigStruct = {
  fee: 10 * PERCENT_PRECISION, // 10% fee
  threshold: 0.1 * PERCENT_PRECISION, // update storage at >0.1% changes in utilization
  token: TOKEN,
  maxUtilization: 1e4, // 100%
};

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const listTokenConfigs = () => ({
  token: TOKEN,
  liquidity: {
    rateData: LIQUIDITY_RATE_DATA,
    tokenConfig: LIQUIDITY_TOKEN_CONFIG,
  },
  lending: {
    // not needed when listing native ETH
    isNativeUnderlying: IS_FTOKEN_NATIVE,
    lendingRewardsRateModel: null,
    fToken: {
      supplyConfig: null,
    },
  },
});
//#endregion
