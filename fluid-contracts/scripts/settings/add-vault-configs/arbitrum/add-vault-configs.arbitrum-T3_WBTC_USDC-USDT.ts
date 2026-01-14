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
const VAULT_QUEUE_COUNTER = 4; // id 26

const VAULTTYPE = VAULT_TYPE.T3_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WBTC.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.DEX_USDC_USDT.address;

// const ORACLE_CONFIG: GenericOracleL2Config = {
//   oracleName: "GenericOracleL2_WBTC_USD",
//   contractName: "FluidGenericOracleL2",
//   infoName: "USD per 1 WBTC",
//   sources: [
//     {
//       sourceType: GenericOracleSourceType.Chainlink,
//       source: "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57", // WBTC <> USD
//       invertRate: false,
//       multiplier: BigNumber.from(10).pow(19), // scale WBTC to e27
//       divisor: 1,
//     },
//   ],
// };
// deployed at 0x4C8176A5d4Dd51483abd4bD422F3844a17D9Bcc5
const COL_DEBT_ORACLE = "0x4C8176A5d4Dd51483abd4bD422F3844a17D9Bcc5";

const ORACLE_CONFIG: DexSmartDebtPegOracleL2Config = {
  oracleName: "DexSmartDebtPegOracleL2_WBTC_USDC-USDT",
  contractName: "DexSmartDebtPegOracleL2",
  infoName: "USDC/USDT debtSh. per 1 WBTC",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT -> doesn't matter here as we assume 1:1
    infoName: "USDC/USDT debtSh. per 1 WBTC",
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
