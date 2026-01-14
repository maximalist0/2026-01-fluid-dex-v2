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
const VAULT_QUEUE_COUNTER = 3; // id 65

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_USDE_USDC.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_USDE_USDC.address;

const ORACLE_CONFIG = null;
// DEPLOYED IN 2 PARTS:
// PART1 USDC per 1 GHO/USDC colShare:
// const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
//   oracleName: "DexSmartColPegOracle_GHO-USDC_ColShares",
//   contractName: "DexSmartColPegOracle",
//   infoName: "USDC per 1 GHO/USDC colShare",
//   dexPool: SUPPLY_TOKEN,
//   reservesConversionInvert: false,
//   quoteInToken0: false,
//   reservesConversionOracle: ethers.constants.AddressZero,
//   reservesPegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
//   colDebtOracle: ethers.constants.AddressZero,
//   colDebtInvert: false,
//   colDebtDecimals: 18, // neutralize to Shares = 1e18 as not used
// };
// // PART2 GHO/USDC debtShare/colShare:
// const ORACLE_CONFIG: DexSmartDebtPegOracleConfig = {
//   oracleName: "DexSmartDebtPegOracle_GHO-USDC-COL_GHO-USDC-DEBT",
//   contractName: "DexSmartDebtPegOracle",
//   infoName: "GHO/USDC dbtSh. per 1 colSh.",
//   dexPool: BORROW_TOKEN,
//   reservesConversionInvert: false,
//   quoteInToken0: false,
//   reservesConversionOracle: ethers.constants.AddressZero,
//   reservesPegBufferPercent: 1000, // 10000 = 1%; 100 = 0.01%
//   colDebtOracle: "", // result from Part1
//   colDebtInvert: false,
//   colDebtDecimals: 18, // neutralize to Shares = 1e18
// };

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
