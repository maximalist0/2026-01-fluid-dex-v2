import { BigNumber } from "ethers";

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
const VAULT_QUEUE_COUNTER = 7; // id 123

const VAULTTYPE = VAULT_TYPE.T2_SMART_COL;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_PAXG_XAUT.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDT.address;

const ORACLE_CONFIG: DexSmartColPegOracleConfig = {
  oracleName: "DexSmartColPegOracle_PAXG-XAUT_USDT",
  contractName: "DexSmartColPegOracle",
  params: {
    dexPool: SUPPLY_TOKEN,
    quoteInToken0: false, // quote in XAUT
    targetDecimals: 15, // (18 decimals shares vs 6 decimals USDT so 27 - 12)
    infoName: "USDT per 1 PAXG/XAUT colShare",
    pegBufferPercent: 5000, // 10000 = 1%; 100 = 0.01%
    reservesConversionParams: {
      reservesConversionOracle: ethers.constants.AddressZero,
      reservesConversionInvert: false,
      reservesConversionPriceMultiplier: 1,
      reservesConversionPriceDivisor: 1,
    },
    resultMultiplier: 1,
    resultDivisor: 1e12, // divide from e27 scale result to e15
    colDebtOracle: "0xc163a416F7417bfcfFa809524D035917A7C684f2", // GenericOracle_XAUT_USDT
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
