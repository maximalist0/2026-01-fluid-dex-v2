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
  DexSmartColPegOracleConfig,
  DexSmartDebtPegOracleConfig,
  DexSmartT4PegOracleL2Config,
} from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_ARBITRUM } from "../token-addresses";
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
const VAULT_QUEUE_COUNTER = 1; // id #55

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.DEX_USDE_USDT.address;

const BORROW_TOKEN = TOKENS_ARBITRUM.DEX_USDC_USDT.address;

const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_T4_USDE-USDT_USDC-USDT",
  contractName: "DexSmartDebtPegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT -> doesn't matter here as we assume 1:1
    infoName: "USDC-T dbtSh /1 USDE-USDT colSh",
    targetDecimals: 27, // shares = 18 decimals, USDAI = 18 decimals
    pegBufferPercent: 1000, // 0.1%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1e12,
    resultDivisor: 1,
    colDebtOracle: "0xEbE148834F3f046ae64CF1247F5d9a2d5a4ABDd1", // DexSmartColPegOracleL2_USDE-USDT_USDT "USDT per 1 USDE/USDT colSh.",
    colDebtInvert: false,
  },
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
});
//#endregion
