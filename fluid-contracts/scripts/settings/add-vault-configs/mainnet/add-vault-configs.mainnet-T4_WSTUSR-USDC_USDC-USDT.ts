import { VAULT_TYPE } from "../config-utils";
import { DexSmartColPegOracleConfig, DexSmartDebtPegOracleConfig } from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 1; // id 134

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_WSTUSR_USDC.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_USDC_USDT.address;

const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_T4_WSTUSR-USDC_USDC-USDT",
  contractName: "DexSmartDebtPegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT
    infoName: "USDC-T dbt /1 WSTUSR-USDC col",
    targetDecimals: 27,
    pegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1e12, // from USDC to shares
    resultDivisor: 1,
    colDebtOracle: "0x8f0d0c28aB011544AF60fbeDcd3Ec6E548D59CAd", // DexSmartColPegOracle_WSTUSR-USDC_USDC  USDC per 1 WSTUSR-USDC colShare
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
