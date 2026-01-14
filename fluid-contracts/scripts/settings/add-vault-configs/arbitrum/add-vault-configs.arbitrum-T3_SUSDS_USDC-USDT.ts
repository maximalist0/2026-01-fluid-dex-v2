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
  GenericOracleSourceType,
  GenericOracleL2Config,
  DexSmartDebtPegOracleL2Config,
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
const VAULT_QUEUE_COUNTER = 0; // id 30

const VAULTTYPE = VAULT_TYPE.T3_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.SUSDS.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.DEX_USDC_USDT.address;

// const ORACLE_CONFIG: GenericOracleL2Config = {
//   oracleName: "GenericOracleL2_SUSDS_USDS",
//   contractName: "FluidGenericOracleL2",
//   infoName: "USDS per 1 SUSDS",
//   targetDecimals: 27,
//   sources: [
//     {
//       sourceType: GenericOracleSourceType.Chainlink,
//       source: "0x84AB0c8C158A1cD0d215BE2746cCa668B79cc287", // SUSDS <> USDS Contract rate via Chainlink interface, returns rate in e27!!
//       invertRate: false,
//       multiplier: 1, // rate is already in e27
//       divisor: 1,
//     },
//   ],
// };
// deployed at 0x7Eb4AD0aa82e9Bb5c08e1738a44018e0E3A02eB9
const COL_DEBT_ORACLE = "0x7Eb4AD0aa82e9Bb5c08e1738a44018e0E3A02eB9";

const ORACLE_CONFIG: DexSmartDebtPegOracleL2Config = {
  oracleName: "DexSmartDebtPegOracleL2_SUSDS_USDC-USDT",
  contractName: "DexSmartDebtPegOracleL2",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT -> doesn't matter here as we assume 1:1
    infoName: "USDC/USDT debtSh. per 1 SUSDS",
    targetDecimals: 27, // shares = 18 decimals, SUSDS = 18 decimals
    pegBufferPercent: 1000, // 0.1%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1,
    resultDivisor: 1,
    colDebtOracle: COL_DEBT_ORACLE, // see SUSDS_USDS oracle above
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
