import { BigNumber } from "ethers";
import { VAULT_TYPE } from "../config-utils";

import { TOKENS_PLASMA } from "../token-addresses";
import { ORACLES_PLASMA } from "../oracle-addresses";
import { GenericOracleConfig, GenericOracleSourceType, VaultCoreSettings } from "./add-vault-interfaces";
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
const VAULT_QUEUE_COUNTER = 0; // id 23

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_PLASMA.SYRUPUSDT.address;
const SUPPLY_DECIMALS = TOKENS_PLASMA.SYRUPUSDT.decimals; // count of decimals
const SUPPLY_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(SUPPLY_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const BORROW_TOKEN = TOKENS_PLASMA.GHO.address;
const BORROW_DECIMALS = TOKENS_PLASMA.GHO.decimals; // count of decimals
const BORROW_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(BORROW_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_SYRUPUSDT_GHO",
  contractName: "FluidGenericOracle",
  infoName: "GHO per 1 SYRUPUSDT",
  targetDecimals: 39,
  sources: [
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: ORACLES_PLASMA.SYRUPUSDT_USDT_CAPPED, // FluidCappedRate SYRUPUSDT
      invertRate: false,
      multiplier: 1e12,
      divisor: 1,
    },
  ],
};

// rebalancer likely stays the same on all vaults. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const VAULT_CORE_SETTINGS: VaultCoreSettings = {
  supplyRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  borrowRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  collateralFactor: 88 * PERCENT_PRECISION,
  liquidationThreshold: 90 * PERCENT_PRECISION,
  liquidationMaxLimit: 95 * PERCENT_PRECISION,
  withdrawGap: 5 * PERCENT_PRECISION,
  liquidationPenalty: 2 * PERCENT_PRECISION,
  borrowFee: 0,
};

const VAULT_SUPPLY_CONFIG = (vault: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  baseWithdrawalLimit: SUPPLY_DECIMALS_MULTIPLIER.mul(6_000),
  expandDuration: 60 * 60 * 6, // 6hrs in seconds.
  expandPercent: 50 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: SUPPLY_TOKEN, // SHOULD NOT CHANGE.
  user: vault, // SHOULD NOT CHANGE
});

const VAULT_BORROW_CONFIG = (vault: string): AdminModuleStructs.UserBorrowConfigStruct => ({
  baseDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(7_000),
  maxDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(9_000),
  expandDuration: 60 * 60 * 6, // 6hrs in seconds.
  expandPercent: 50 * PERCENT_PRECISION, // in 1e2
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
