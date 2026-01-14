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
const VAULT_QUEUE_COUNTER = 2; // id 89

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.TBTC.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDT.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_TBTC_USDT",
  contractName: "FluidGenericOracle",
  infoName: "USDT per 1 TBTC",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC<>USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // assuming 1 BTC = 1 TBTC so scale 1 TBTC (18 decimals!!) to e27
      divisor: 1e2, // divide by 1e2 as USDT has 6 decimals vs USD 8
    },
    // assuming 1 USDC = 1 USD
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
