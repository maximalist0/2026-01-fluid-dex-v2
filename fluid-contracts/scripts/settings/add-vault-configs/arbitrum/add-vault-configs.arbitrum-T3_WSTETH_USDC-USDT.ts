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
const VAULT_QUEUE_COUNTER = 2; // id 24

const VAULTTYPE = VAULT_TYPE.T3_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WSTETH.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.DEX_USDC_USDT.address;

// const ORACLE_CONFIG: GenericOracleL2Config = {
//   oracleName: "GenericOracleL2_WSTETH_USD",
//   contractName: "FluidGenericOracleL2",
//   infoName: "USD per 1 WSTETH",
//   sources: [
//     {
//       sourceType: GenericOracleSourceType.Chainlink,
//       source: "0xb523AE262D20A936BC152e6023996e46FDC2A95D", // WSTETH <> ETH
//       invertRate: false,
//       multiplier: BigNumber.from(10).pow(9), // scale WSTETH to e27
//       divisor: 1,
//     },
//     {
//       sourceType: GenericOracleSourceType.Chainlink,
//       source: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", // ETH <> USD
//       invertRate: false,
//       multiplier: BigNumber.from(10).pow(9), // scale ETH to e27
//       divisor: 1,
//     },
//   ],
// };
// deployed at 0x05B1e021C9B764a6e8B0113f0E0A7624D4aC7E91
const COL_DEBT_ORACLE = "0x05B1e021C9B764a6e8B0113f0E0A7624D4aC7E91";

const ORACLE_CONFIG: DexSmartDebtPegOracleL2Config = {
  oracleName: "DexSmartDebtPegOracleL2_WSTETH_USDC-USDT",
  contractName: "DexSmartDebtPegOracleL2",
  infoName: "USDC/USDT debtSh. per 1 WSTETH",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT -> doesn't matter here as we assume 1:1
    infoName: "USDC/USDT debtSh. per 1 WSTETH",
    pegBufferPercent: 1000, // 0.1%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1e10, // scale to e27. diff USD to shares
    resultDivisor: 1,
    colDebtOracle: COL_DEBT_ORACLE, // see oracle above
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
