import { VAULT_TYPE } from "../config-utils";
import { DexSmartColPegOracleConfig, DexSmartDebtPegOracleConfig } from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { ORACLES_MAINNET } from "../oracle-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 149

const VAULTTYPE = VAULT_TYPE.T2_SMART_COL;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_SYRUPUSDT_USDT.address;

const BORROW_TOKEN = TOKENS_MAINNET.USDT.address;

const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
  oracleName: "DexSmartColPegOracle_SYRUPUSDT-USDT_USDT",
  contractName: "DexSmartColPegOracle",
  params: {
    dexPool: SUPPLY_TOKEN,
    quoteInToken0: false, // quote in USDT
    infoName: "USDT per 1 SYRUPUSDT/USDT colSh.",
    targetDecimals: 15,
    pegBufferPercent: 5000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: ORACLES_MAINNET.SYRUPUSDT_USDT_CAPPED,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1,
    resultDivisor: 1e12, // divide from 2e27 scale result to 2e15
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
