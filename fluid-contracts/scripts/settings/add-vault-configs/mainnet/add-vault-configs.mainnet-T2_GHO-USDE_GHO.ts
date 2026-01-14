import { VAULT_TYPE } from "../config-utils";
import {
  DexSmartColPegOracleConfig,
  DexSmartDebtPegOracleConfig,
  DexSmartT4PegOracleConfig,
} from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 140

const VAULTTYPE = VAULT_TYPE.T2_SMART_COL;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_GHO_USDE.address;

const BORROW_TOKEN = TOKENS_MAINNET.GHO.address;

const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
  oracleName: "DexSmartColPegOracle_GHO-USDE_GHO",
  contractName: "DexSmartColPegOracle",
  params: {
    dexPool: SUPPLY_TOKEN,
    quoteInToken0: true, // quote in GHO
    infoName: "GHO per 1 GHO/USDE colShare",
    targetDecimals: 27,
    pegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1,
    resultDivisor: 1,
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
//#endregion0
