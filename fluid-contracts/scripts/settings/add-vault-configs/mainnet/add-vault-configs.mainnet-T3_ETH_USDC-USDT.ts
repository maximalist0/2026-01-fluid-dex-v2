import { BigNumber, ethers } from "ethers";

import { MODE_WITH_INTEREST, PERCENT_PRECISION, VAULT_TYPE } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { UniV3OracleImpl } from "../../../typechain-types/contracts/oracle/oracles/cLFallbackUniV3Oracle.sol/CLFallbackUniV3Oracle";
import {
  CLFallbackUniV3OracleConfig,
  FallbackCLRSOracleConfig,
  UniV3CheckCLRSOracleConfig,
  VaultCoreSettings,
  WstETHOracleConfig,
  DexSmartDebtPegOracleConfig,
} from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { RESERVE_CONTRACT } from "../contract-addresses";
import { GOVERNANCE } from "../core-configs/core-configs";
import { Structs as ExpandPercentConfigHandlerStructs } from "../../../typechain-types/contracts/config/expandPercentHandler/main.sol/FluidExpandPercentConfigHandler";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 1;

const VAULTTYPE = VAULT_TYPE.T3_SMART_DEBT;

const SUPPLY_TOKEN = NATIVE_TOKEN.address;
const SUPPLY_DECIMALS = NATIVE_TOKEN.decimals; // count of decimals
const SUPPLY_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(SUPPLY_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const BORROW_TOKEN = TOKENS_MAINNET.DEX_USDC_USDT.address;
const BORROW_DECIMALS = TOKENS_MAINNET.DEX_USDC_USDT.decimals; // count of decimals
const BORROW_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(BORROW_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const VAULT_CORE_SETTINGS = null;
const REBALANCER = null;

// set to null to skip Rewards contract:
const VAULT_REWARDS = (vault: string) => null as any;

// oracle config must be a valid config from interface from see `add-vault-interfaces.ts`

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_ETH_USDC-USDT",
  contractName: "DexSmartDebtPegOracle",
  infoName: "USDC/USDT debt shares per 1 ETH",
  dexPool: BORROW_TOKEN,
  reservesConversionInvert: false,
  quoteInToken0: false,
  reservesConversionOracle: ethers.constants.AddressZero,
  reservesPegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
  colDebtOracle: "0x5a3bE124A6Dbb34Fadce08E6C1EAe7F3843922A0", // FallbackCLRSOracle_ETH_USD
  colDebtInvert: false,
  colDebtDecimals: 8, // decimals of colDebtOracle Quote asset -> e.g. for CBBTC/USDC -> 6
};

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
    rebalancer: REBALANCER,
  },
  rewards: VAULT_REWARDS,
});
//#endregion
