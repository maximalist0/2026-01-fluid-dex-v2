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
const VAULT_QUEUE_COUNTER = 3; // id 139

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_GHO_USDE.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_GHO_USDC.address;

// part 1: Smart col oracle
// const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
//   oracleName: "DexSmartColPegOracle_GHO-USDE_USDC",
//   contractName: "DexSmartColPegOracle",
//   params: {
//     dexPool: SUPPLY_TOKEN,
//     quoteInToken0: true, // quote in GHO
//     infoName: "USDC per 1 GHO/USDE colShare",
//     targetDecimals: 15,
//     pegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
//     reservesConversionParams: {
//       reservesConversionOracle: ethers.constants.AddressZero,
//       reservesConversionInvert: false,
//       reservesConversionPriceMultiplier: 1,
//       reservesConversionPriceDivisor: 1,
//     },
//     resultMultiplier: 1,
//     resultDivisor: 1e12, // divide from 2e27 scale result to 2e15
//     colDebtOracle: ethers.constants.AddressZero,
//     colDebtInvert: false,
//   },
// };

// part 2: combine smart col oracle deployed at 0xBAEE541910C913Ecb154cB847d244Ef566C0d088 with smart debt oracle
const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_T4_GHO-USDE_GHO-USDC",
  contractName: "DexSmartDebtPegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT
    infoName: "GHO-USDC dbt /1 GHO-USDE col",
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
    colDebtOracle: "0xBAEE541910C913Ecb154cB847d244Ef566C0d088", // DexSmartColPegOracle_GHO-USDE_USDC see above
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
