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
const VAULT_QUEUE_COUNTER = 2; // #86

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.CBBTC.address;
const BORROW_TOKEN = TOKENS_MAINNET.SUSDS.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_CBBTC_SUSDS",
  contractName: "FluidGenericOracle",
  infoName: "SUSDS per 1 CBBTC",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC<>USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(29), // scale token 0 BTC to 27, but then we have 1e8 USD, scaling to USDS which is 1e18, so * 1e10
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0x23F966DE6C008601972A8057B5767F70E91Cf66F", // SUSDS<>USDS contract rate
      invertRate: true,
      multiplier: 1, // scale to 1e27
      divisor: 1,
    },
  ],
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
