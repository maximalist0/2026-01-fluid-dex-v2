import { VAULT_TYPE } from "../config-utils";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { DexSmartColPegOracleConfig, DexSmartDebtPegOracleConfig } from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 125

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_GHO_SUSDE.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_GHO_USDC.address;

// part 1: Smart col oracle
// const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
//   oracleName: "DexSmartColPegOracle_GHO-SUSDE_USDC",
//   contractName: "DexSmartColPegOracle",
//   params: {
//     dexPool: SUPPLY_TOKEN,
//     quoteInToken0: true, // quote in GHO
//     infoName: "USDC per 1 GHO/SUSDE colShare",
//     targetDecimals: 15,
//     pegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
//     reservesConversionParams: {
//       reservesConversionOracle: "0x7F8E0be00A22b251eee9a70d17Ec2980354543A8", // SUSDE contract rate
//       reservesConversionInvert: true,
//       reservesConversionPriceMultiplier: 1,
//       reservesConversionPriceDivisor: 1,
//     },
//     resultMultiplier: 1,
//     resultDivisor: 1e12, // divide from 2e27 scale result to 2e15
//     colDebtOracle: ethers.constants.AddressZero,
//     colDebtInvert: false,
//   },
// };

// part 2: combine smart col oracle deployed at 0xdd48B70ec2A3F5B27caE13395e64c44856FAa47A with smart debt oracle

const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
  oracleName: "DexSmartDebtPegOracle_T4_GHO-SUSDE_GHO-USDC",
  contractName: "DexSmartDebtPegOracle",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDT
    infoName: "SUSDE-GHO dbt /1 GHO-USDC col",
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
    colDebtOracle: "0xdd48B70ec2A3F5B27caE13395e64c44856FAa47A", // DexSmartColPegOracle_GHO-SUSDE_USDC see above
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
