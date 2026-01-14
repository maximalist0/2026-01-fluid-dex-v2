import { BigNumber } from "ethers";

import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { GenericOracleConfig, GenericOracleSourceType } from "./add-vault-interfaces";
import { VAULT_TYPE } from "../config-utils";
import { ORACLES_MAINNET } from "../oracle-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 2; // id 155

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.OSETH.address;
const BORROW_TOKEN = TOKENS_MAINNET.GHO.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_OSETH_GHO",
  contractName: "FluidGenericOracle",
  infoName: "GHO per 1 OSETH",
  targetDecimals: 27,
  sources: [
    {
      sourceType: GenericOracleSourceType.Redstone,
      source: ORACLES_MAINNET.OSETH_ETH_REDSTONE,
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // rate is in 1e8 -> scale to e27 (+19)
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: ORACLES_MAINNET.ETH_USD,
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // scale ETH to e27 (+9), adjust USD to GHO (+10)
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
