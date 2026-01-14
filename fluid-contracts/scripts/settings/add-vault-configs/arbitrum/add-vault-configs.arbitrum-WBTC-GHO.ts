import { BigNumber } from "ethers";

import { NATIVE_TOKEN, TOKENS_MAINNET, TOKENS_ARBITRUM } from "../token-addresses";
import { GenericOracleConfig, GenericOracleL2Config, GenericOracleSourceType } from "./add-vault-interfaces";
import { VAULT_TYPE } from "../config-utils";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 3; // # 34

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WBTC.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.GHO.address;

const ORACLE_CONFIG: GenericOracleL2Config = {
  oracleName: "GenericOracleL2_WBTC_GHO",
  contractName: "FluidGenericOracleL2",
  infoName: "GHO per 1 WBTC",
  targetDecimals: 37, // scale WBTC 8 to 27 + GHO
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57", // WBTC <> USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(29), // scale WBTC to e27, and from USD to GHO
      divisor: 1,
    },
  ],
  // assume 1 GHO = 1 USD
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
