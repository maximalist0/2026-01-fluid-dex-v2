import { VAULT_TYPE } from "../config-utils";
import { DexSmartT4CLOracleConfig } from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 105

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_CBBTC_USDT.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_CBBTC_USDT.address;

const ORACLE_CONFIG: DexSmartT4CLOracleConfig = {
  oracleName: "DexSmartT4CLOracle_CBBTC-USDT",
  contractName: "DexSmartT4CLOracle",
  infoName: "CBBTC/USDT dbtSh. per 1 colSh.",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT
    infoName: "CBBTC/USDT dbtSh. per 1 colSh.",
    reservesConversion: {
      hops: 2,
      feed1: {
        feed: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC <> USD
        invertRate: false,
        token0Decimals: 8,
      },
      feed2: {
        feed: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D", // USDT <> USD
        invertRate: true,
        token0Decimals: 6,
      },
      feed3: {
        feed: ethers.constants.AddressZero,
        invertRate: false,
        token0Decimals: 0,
      },
    },
    // reserves conversion price must end up at e27 scale same as underlying dex price
    // e.g. 97639.999988300472680839160791040 USDT per BTC. USDT per BTC scaled to e27 ends up in e25 decimals (-2 decimals diff)
    // so need to multiply be 1e2 to get to 1e27
    reservesConversionPriceMultiplier: 1e2,
    reservesConversionPriceDivisor: 1,
    // diff shares / shares = 0
    resultMultiplier: 1,
    resultDivisor: 1,
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
