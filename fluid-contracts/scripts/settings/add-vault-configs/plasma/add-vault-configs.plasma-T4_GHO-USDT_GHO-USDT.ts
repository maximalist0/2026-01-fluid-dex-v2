import { BigNumber } from "ethers";
import { VAULT_TYPE } from "../config-utils";

import { TOKENS_PLASMA } from "../token-addresses";
import { ORACLES_PLASMA } from "../oracle-addresses";
import {
  GenericOracleConfig,
  GenericOracleSourceType,
  VaultT4CoreSettings,
  DexSmartT4PegOracleConfig,
} from "./add-vault-interfaces";
import { MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { RESERVE_CONTRACT } from "../contract-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 33

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_PLASMA.DEX_GHO_USDT.address;
const SUPPLY_DECIMALS = TOKENS_PLASMA.DEX_GHO_USDT.decimals; // count of decimals
const SUPPLY_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(SUPPLY_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const BORROW_TOKEN = TOKENS_PLASMA.DEX_GHO_USDT.address;
const BORROW_DECIMALS = TOKENS_PLASMA.DEX_GHO_USDT.decimals; // count of decimals
const BORROW_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(BORROW_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const ORACLE_CONFIG: DexSmartT4PegOracleConfig = {
  oracleName: "DexSmartT4PegOracle_GHO-USDT",
  contractName: "DexSmartT4PegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: true, // quote in GHO
    infoName: "GHO/USDT dbtSh. per 1 colSh.",
    targetDecimals: 27,
    pegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1,
    resultDivisor: 1,
  },
};

// rebalancer likely stays the same on all vaults. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const VAULT_CORE_SETTINGS: VaultT4CoreSettings = {
  supplyRate: 0,
  borrowRate: 0,
  collateralFactor: 92 * PERCENT_PRECISION,
  liquidationThreshold: 95 * PERCENT_PRECISION,
  liquidationMaxLimit: 97 * PERCENT_PRECISION,
  withdrawGap: 5 * PERCENT_PRECISION,
  liquidationPenalty: Math.round(2 * PERCENT_PRECISION),
  borrowFee: 0,
};

const VAULT_SUPPLY_CONFIG = (vault: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  baseWithdrawalLimit: SUPPLY_DECIMALS_MULTIPLIER.mul(4_000),
  expandDuration: 60 * 60 * 6, // 6hrs in seconds.
  expandPercent: 35 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: SUPPLY_TOKEN, // SHOULD NOT CHANGE.
  user: vault, // SHOULD NOT CHANGE
});

const VAULT_BORROW_CONFIG = (vault: string): AdminModuleStructs.UserBorrowConfigStruct => ({
  baseDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(3_500),
  maxDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(4_000),
  expandDuration: 60 * 60 * 6, // 6hrs in seconds.
  expandPercent: 30 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: BORROW_TOKEN, // SHOULD NOT CHANGE
  user: vault, // SHOULD NOT CHANGE
});

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const addVaultConfigs = () => ({
  vaultType: VAULTTYPE,
  addToVaultIdCounter: VAULT_QUEUE_COUNTER,
  supplyToken: SUPPLY_TOKEN,
  borrowToken: BORROW_TOKEN,
  oracle: ORACLE_CONFIG,
  vault: {
    coreSettings: VAULT_CORE_SETTINGS,
    supplyConfig: VAULT_SUPPLY_CONFIG,
    borrowConfig: VAULT_BORROW_CONFIG,
    rebalancer: REBALANCER,
  },
});
//#endregion
