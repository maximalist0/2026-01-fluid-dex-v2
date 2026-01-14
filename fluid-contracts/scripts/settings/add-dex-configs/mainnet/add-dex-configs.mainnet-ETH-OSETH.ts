import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A DEX, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE DEX DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE DEX DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because dex logs etc. are affected by dexId, which is increased by one for each new deployment
const DEX_QUEUE_COUNTER = 0; // id 43

// token0 has to be smaller than token1
const TOKEN0 = NATIVE_TOKEN.address;
const TOKEN1 = TOKENS_MAINNET.OSETH.address;
// ORACLE_MAPPING: considering 12 sec block:
// 8192 = ~9 days
// 4096 = ~4.5 days
// 1024 = ~1 day
const ORACLE_MAPPING = 1024;

// center price config must be a valid config from interface from see `add-vault-interfaces.ts`

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const CENTER_PRICE_CONFIG = null;

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const addDexConfigs = () => ({
  addToDexIdCounter: DEX_QUEUE_COUNTER,
  token0: TOKEN0,
  token1: TOKEN1,
  oracleMapping: ORACLE_MAPPING,
  centerPrice: CENTER_PRICE_CONFIG,
});
//#endregion
