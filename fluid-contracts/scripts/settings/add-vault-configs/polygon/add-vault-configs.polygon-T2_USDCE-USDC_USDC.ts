import { VAULT_TYPE } from "../config-utils";
import { NATIVE_TOKEN, TOKENS_POLYGON } from "../token-addresses";
import { DexSmartColPegOracleConfig } from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 26

const VAULTTYPE = VAULT_TYPE.T2_SMART_COL;

const SUPPLY_TOKEN = TOKENS_POLYGON.DEX_USDCE_USDC.address;

const BORROW_TOKEN = TOKENS_POLYGON.USDC.address;

const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
  oracleName: "DexSmartColPegOracle_USDCE-USDC_USDC",
  contractName: "DexSmartColPegOracle",
  params: {
    dexPool: SUPPLY_TOKEN,
    quoteInToken0: false, // quote in USDC
    targetDecimals: 15, // (18 decimals shares vs 6 decimals USDC so 27 - 12)
    infoName: "USDC per 1 USDCE/USDC colShare",
    pegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1,
    resultDivisor: 1e12,
    colDebtOracle: ethers.constants.AddressZero,
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
