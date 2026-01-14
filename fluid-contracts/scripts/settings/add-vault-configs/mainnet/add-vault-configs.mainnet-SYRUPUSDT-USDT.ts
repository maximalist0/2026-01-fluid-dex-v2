import { ethers } from "ethers";

import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { VAULT_TYPE } from "../config-utils";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { ORACLES_MAINNET } from "../oracle-addresses";
import {
  FallbackCLRSOracleConfig,
  PegOracleConfig,
  GenericOracleConfig,
  GenericOracleSourceType,
} from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 2; // id 151

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.SYRUPUSDT.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDT.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_SYRUPUSDT_USDT",
  contractName: "FluidGenericOracle",
  infoName: "USDT per 1 SYRUPUSDT",
  sources: [
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: ORACLES_MAINNET.SYRUPUSDT_USDT_CAPPED,
      invertRate: false,
      multiplier: 1,
      divisor: 1,
    },
  ],
  targetDecimals: 27,
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
