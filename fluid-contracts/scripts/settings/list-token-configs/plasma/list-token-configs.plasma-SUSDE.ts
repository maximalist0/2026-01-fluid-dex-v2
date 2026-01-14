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

const TOKEN = TOKENS_PLASMA.SUSDE.address;

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
});
//#endregion
