import { VAULT_TYPE } from "../config-utils";
import { NATIVE_TOKEN, TOKENS_POLYGON } from "../token-addresses";
import { DexSmartT4PegOracleConfig } from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 1; // id 27

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_POLYGON.DEX_POL_TRUMATIC.address;

const BORROW_TOKEN = TOKENS_POLYGON.DEX_POL_TRUMATIC.address;

const ORACLE_CONFIG: DexSmartT4PegOracleConfig = {
  oracleName: "DexSmartT4PegOracle_POL-TRUMATIC",
  contractName: "DexSmartT4PegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: true, // quote in POL
    infoName: "POL/TRUMATIC dbtSh. per 1 colSh.",
    targetDecimals: 27,
    pegBufferPercent: 5000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: "0x0453911F12b414e8a9Fa2f38171b04fBD165BeE1", // FluidCappedRate for TRUMATIC<>Matic
      reservesConversionInvert: true,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
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
