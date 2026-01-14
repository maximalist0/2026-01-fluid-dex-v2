import { BigNumber, ethers } from "ethers";

import { VAULT_TYPE } from "../config-utils";
import { TOKENS_POLYGON } from "../token-addresses";
import { GenericOracleSourceType, GenericOracleConfig } from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 8; // id 9

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_POLYGON.WBTC.address;
const BORROW_TOKEN = TOKENS_POLYGON.USDC.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_WBTC_USDC",
  contractName: "FluidGenericOracle",
  infoName: "USDC per 1 WBTC",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6", // WBTC<>USD: https://data.chain.link/feeds/polygon/mainnet/wbtc-usd returns price in 8 decimals
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // scale WBTC to e27 (+19), adjust USD to USDC (-2)
      divisor: 1e2,
    },
  ],
  targetDecimals: 25, // scale wbtc 8 to 27 + USDC
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
