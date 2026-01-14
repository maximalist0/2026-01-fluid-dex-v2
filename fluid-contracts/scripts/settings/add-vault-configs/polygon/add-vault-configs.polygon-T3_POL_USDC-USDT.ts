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
const VAULT_QUEUE_COUNTER = 0; // id 17

const VAULTTYPE = VAULT_TYPE.T3_SMART_DEBT;

const SUPPLY_TOKEN = NATIVE_TOKEN.address;

const BORROW_TOKEN = TOKENS_POLYGON.DEX_USDC_USDT.address;

// const ORACLE_CONFIG: GenericOracleConfig = {
//   oracleName: "GenericOracle_POL_USD",
//   contractName: "FluidGenericOracle",
//   infoName: "USD per 1 POL",
//   targetDecimals: 17,
//   sources: [
//     {
//       sourceType: GenericOracleSourceType.Chainlink,
//       source: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0", // MATIC<>USD: https://data.chain.link/feeds/polygon/mainnet/matic-usd returns price in 8 decimals
//       invertRate: false,
//       multiplier: BigNumber.from(10).pow(9), // scale POL to e27 (+9)
//       divisor: 1,
//     },
//   ],
// };
// deployed at 0x9c9cad6Dd23fbDCdA3348726c306bAF20c428c4C
const COL_DEBT_ORACLE = "0x9c9cad6Dd23fbDCdA3348726c306bAF20c428c4C";

const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_POL_USDC-USDT",
  contractName: "DexSmartDebtPegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT -> doesn't matter here as we assume 1:1
    infoName: "USDC/USDT debt shares per 1 POL",
    targetDecimals: 27,
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
