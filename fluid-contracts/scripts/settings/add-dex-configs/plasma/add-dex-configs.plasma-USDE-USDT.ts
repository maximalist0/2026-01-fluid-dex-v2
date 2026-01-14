import { NATIVE_TOKEN, TOKENS_PLASMA } from "../token-addresses";
import { BigNumber, utils } from "ethers";
import { DEXT1_THRESHOLD_SHIFT_TIME_MAX, MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { Structs as DexAdminModuleStructs } from "../../../typechain-types/contracts/protocols/dex/poolT1/adminModule/main.sol/FluidDexT1Admin";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A DEX, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE DEX DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE DEX DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because dex logs etc. are affected by dexId, which is increased by one for each new deployment
const DEX_QUEUE_COUNTER = 0; // id 0

// token0 has to be smaller than token1
const TOKEN0 = TOKENS_PLASMA.USDE;
const TOKEN1 = TOKENS_PLASMA.USDT;
const TOKEN0_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN0.decimals);
const TOKEN1_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(TOKEN1.decimals);

const ORACLE_MAPPING = 12288; // 12288 on Plasma (1s block time) to be consistent ~1 day everywhere

const DEX_SUPPLY_TOKEN0_CONFIG = (dexT1: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  baseWithdrawalLimit: TOKEN0_DECIMALS_MULTIPLIER.mul(9_000_000), // = ~9M USD
  expandDuration: 60 * 60 * 1, // 1hrs in seconds.
  expandPercent: 50 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: TOKEN0.address, // SHOULD NOT CHANGE.
  user: dexT1, // SHOULD NOT CHANGE
});

const DEX_SUPPLY_TOKEN1_CONFIG = (dexT1: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  baseWithdrawalLimit: TOKEN1_DECIMALS_MULTIPLIER.mul(9_000_000), // = ~9M USD
  expandDuration: 60 * 60 * 1, // 1hrs in seconds.
  expandPercent: 50 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: TOKEN1.address, // SHOULD NOT CHANGE.
  user: dexT1, // SHOULD NOT CHANGE
});

const DEX_INIT_SETTINGS: DexAdminModuleStructs.InitializeVariablesStruct = {
  smartCol: true,
  token0ColAmt: TOKEN0_DECIMALS_MULTIPLIER.mul(5), // ~5 USD
  smartDebt: false,
  token0DebtAmt: 0,
  centerPrice: BigNumber.from(10).pow(27),
  fee: 1e4 * 0.01,
  revenueCut: 0,
  upperPercent: 1e4 * 0.2,
  lowerPercent: 1e4 * 0.2,
  upperShiftThreshold: 0,
  lowerShiftThreshold: 0,
  thresholdShiftTime: DEXT1_THRESHOLD_SHIFT_TIME_MAX,
  centerPriceAddress: 0,
  hookAddress: 0,
  maxCenterPrice: utils.parseUnits("1.00501100", 27),
  minCenterPrice: utils.parseUnits("0.995", 27),
};

const DEX_MAX_SUPPLY_SHARES = BigNumber.from(10).pow(18).mul(10_000_000); // ~20M USD

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const addDexConfigs = () => ({
  addToDexIdCounter: DEX_QUEUE_COUNTER,
  token0: TOKEN0.address,
  token1: TOKEN1.address,
  oracleMapping: ORACLE_MAPPING,
  dex: {
    initializeSettings: DEX_INIT_SETTINGS,
    token0SupplyConfig: DEX_SUPPLY_TOKEN0_CONFIG,
    token1SupplyConfig: DEX_SUPPLY_TOKEN1_CONFIG,
    maxSupplyShares: DEX_MAX_SUPPLY_SHARES,
  },
  TOKEN0_DECIMALS_MULTIPLIER,
  TOKEN1_DECIMALS_MULTIPLIER,
});
//#endregion
