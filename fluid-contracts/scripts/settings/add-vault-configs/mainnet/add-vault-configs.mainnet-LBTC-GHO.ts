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
const VAULT_QUEUE_COUNTER = 2; // id 109

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.LBTC.address;
const BORROW_TOKEN = TOKENS_MAINNET.GHO.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_LBTC_GHO",
  contractName: "FluidGenericOracle",
  infoName: "GHO per 1 LBTC",
  targetDecimals: 37,
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x5c29868C58b6e15e2b962943278969Ab6a7D3212", // LBTC<>BTC
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // scale LBTC to e27 (+19)
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC<>USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(29), // scale BTC to e27 (+19), adjust USD to GHO (+10)
      divisor: 1,
    },
    // assuming 1 GHO = 1 USD
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
