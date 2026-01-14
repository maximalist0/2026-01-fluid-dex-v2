import { BigNumber } from "ethers";

import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { GenericOracleConfig, GenericOracleSourceType } from "./add-vault-interfaces";
import { VAULT_TYPE } from "../config-utils";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 4; // #132

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.CBBTC.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDTB.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_CBBTC_USDTB",
  contractName: "FluidGenericOracle",
  infoName: "USDTB per 1 CBBTC",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC<>USD: https://data.chain.link/feeds/ethereum/mainnet/btc-usd returns price in 8 decimals
      invertRate: false,
      multiplier: BigNumber.from(10).pow(29), // scale CBBTC to e27 (+19), adjust USD to USDTB (+10)
      divisor: 1,
    },
  ],
  targetDecimals: 37, // scale cbbtc 8 to 27 + USDTB
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
