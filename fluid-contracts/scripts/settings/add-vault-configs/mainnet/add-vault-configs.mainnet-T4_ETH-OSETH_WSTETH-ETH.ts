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
const VAULT_QUEUE_COUNTER = 0; // id 158

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_ETH_OSETH.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_WSTETH_ETH.address;

// part 1: Smart col oracle
// const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
//   oracleName: "DexSmartColPegOracle_ETH-OSETH_ETH",
//   contractName: "DexSmartColPegOracle",
//   params: {
//     dexPool: SUPPLY_TOKEN,
//     quoteInToken0: true, // quote in ETH
//     infoName: "ETH per 1 OSETH/ETH colShare",
//     targetDecimals: 27,
//     pegBufferPercent: 5000, // 10000 = 1%; 100 = 0.01%
//     reservesConversionParams: {
//       reservesConversionOracle: ORACLES_MAINNET.OSETH_ETH_CAPPED,
//       reservesConversionInvert: true,
//       reservesConversionPriceMultiplier: 1,
//       reservesConversionPriceDivisor: 1,
//     },
//     resultMultiplier: 1,
//     resultDivisor: 1,
//     colDebtOracle: ethers.constants.AddressZero,
//     colDebtInvert: false,
//   },
// };

// part 2: combine smart col oracle with smart debt oracle
const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_T4_ETH-OSETH_WSTETH-ETH",
  contractName: "DexSmartDebtPegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in ETH
    infoName: "WSTETH-ETH dbt /1 ETH-OSETH col",
    targetDecimals: 27,
    pegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: "0x2F95631D59F564D5e2dD0c028d4DAF3B876D84Fd", // Wsteth contract rate
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1,
    resultDivisor: 1,
    colDebtOracle: "0x2Cb2108641fa4Bb3B7B261432599af481033C272", // DexSmartColPegOracle_ETH-OSETH_ETH see above
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
