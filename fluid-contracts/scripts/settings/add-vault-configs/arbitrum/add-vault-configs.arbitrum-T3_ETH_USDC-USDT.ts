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
const VAULT_QUEUE_COUNTER = 1; // id 23

const VAULTTYPE = VAULT_TYPE.T3_SMART_DEBT;

const SUPPLY_TOKEN = NATIVE_TOKEN.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.DEX_USDC_USDT.address;

// const ORACLE_CONFIG: GenericOracleL2Config = {
//   oracleName: "GenericOracleL2_ETH_USD",
//   contractName: "FluidGenericOracleL2",
//   infoName: "USD per 1 ETH",
//   sources: [
//     {
//       sourceType: GenericOracleSourceType.Chainlink,
//       source: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", // ETH <> USD
//       invertRate: false,
//       multiplier: BigNumber.from(10).pow(9), // scale ETH to e27
//       divisor: 1,
//     },
//   ],
// };
// deployed at 0xf105C65ceB1882CBc9eA3792714BAE3bA6A2cD7d
const COL_DEBT_ORACLE = "0xf105C65ceB1882CBc9eA3792714BAE3bA6A2cD7d";

const ORACLE_CONFIG: DexSmartDebtPegOracleL2Config = {
  oracleName: "DexSmartDebtPegOracleL2_ETH_USDC-USDT",
  contractName: "DexSmartDebtPegOracleL2",
  infoName: "USDC/USDT debt shares per 1 ETH",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT -> doesn't matter here as we assume 1:1
    infoName: "USDC/USDT debt shares per 1 ETH",
    pegBufferPercent: 1000, // 0.1%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1e10, // scale to e27. diff USD to shares
    resultDivisor: 1,
    colDebtOracle: COL_DEBT_ORACLE, // see ETH_USD oracle above
    colDebtInvert: false,
  },
};

// return
//   (debtSharesPer1QuoteToken_ * _getDexColDebtPriceOperate() * RESULT_MULTIPLIER) /
//   (DEX_COL_DEBT_ORACLE_PRECISION * RESULT_DIVISOR);

// e.g. 482989437169083328871362468 * 267012365000000000000 * 1e10 / 1e27 * 1 =
// 1289641518885358445240152733529
// compared to ETH_USDC-USDT on mainnet:
// 1317151598821821675674104602519

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
