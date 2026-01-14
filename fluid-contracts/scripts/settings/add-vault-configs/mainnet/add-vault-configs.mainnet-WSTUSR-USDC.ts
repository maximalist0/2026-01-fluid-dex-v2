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
const VAULT_QUEUE_COUNTER = 3; // id 110

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.WSTUSR.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDC.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_WSTUSR_USDC",
  contractName: "FluidGenericOracle",
  infoName: "USDC per 1 WSTUSR",
  sources: [
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0x1FC9a029e8e84cF0C5c7c68221bE5d1573c0FB05", // FluidCappedRate WSTUSR
      invertRate: false,
      multiplier: 1,
      divisor: 1e12, // scale e27 capped rate to e15
    },
  ],
  targetDecimals: 15,
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
