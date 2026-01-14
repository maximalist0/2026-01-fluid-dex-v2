import { ethers, BigNumber } from "ethers";

import { VAULT_TYPE } from "../config-utils";
import { GenericOracleSourceType, GenericOracleConfig, DexSmartDebtPegOracleConfig } from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_POLYGON } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 1; // id 18

const VAULTTYPE = VAULT_TYPE.T3_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_POLYGON.WBTC.address;

const BORROW_TOKEN = TOKENS_POLYGON.DEX_USDC_USDT.address;

// const ORACLE_CONFIG: GenericOracleConfig = {
//   oracleName: "GenericOracle_WBTC_USD",
//   contractName: "FluidGenericOracle",
//   infoName: "USD per 1 WBTC",
//   targetDecimals: 27,
//   sources: [
//     {
//       sourceType: GenericOracleSourceType.Chainlink,
//       source: "0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6", // WBTC<>USD: https://data.chain.link/feeds/polygon/mainnet/wbtc-usd returns price in 8 decimals
//       invertRate: false,
//       multiplier: BigNumber.from(10).pow(19), // scale WBTC to e27 (+19)
//       divisor: 1,
//     },
//   ],
// };
// deployed at 0xB1f51Fd13C554660c19f96750C4b1d8c9BB31bc4
const COL_DEBT_ORACLE = "0xB1f51Fd13C554660c19f96750C4b1d8c9BB31bc4";

const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_WBTC_USDC-USDT",
  contractName: "DexSmartDebtPegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT -> doesn't matter here as we assume 1:1
    infoName: "USDC/USDT debt shares per 1 WBTC",
    targetDecimals: 37,
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
