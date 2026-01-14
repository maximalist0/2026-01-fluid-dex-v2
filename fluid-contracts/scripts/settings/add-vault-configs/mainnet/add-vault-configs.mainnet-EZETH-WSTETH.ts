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
const VAULT_QUEUE_COUNTER = 0; // id 103

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.EZETH.address;
const BORROW_TOKEN = TOKENS_MAINNET.WSTETH.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_EZETH_WSTETH",
  contractName: "FluidGenericOracle",
  infoName: "WSTETH for 1 EZETH",
  sources: [
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0xE48E7F98911D0311A0FcCC5b0ff3f3f412BaD16C", // ezETH contract rate
      invertRate: false,
      multiplier: 1,
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0x2F95631D59F564D5e2dD0c028d4DAF3B876D84Fd", // wstETH contract rate, inverted
      invertRate: true,
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
