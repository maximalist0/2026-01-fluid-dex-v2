import { BigNumber } from "ethers";

import { NATIVE_TOKEN, TOKENS_MAINNET, TOKENS_BASE } from "../token-addresses";
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
const VAULT_QUEUE_COUNTER = 1; // #22

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_BASE.LBTC.address;
const BORROW_TOKEN = TOKENS_BASE.SUSDS.address;

const ORACLE_CONFIG: GenericOracleL2Config = {
  oracleName: "GenericOracleL2_LBTC_SUSDS",
  contractName: "FluidGenericOracleL2",
  infoName: "SUSDS per 1 LBTC",
  targetDecimals: 37, // scale LBTC 8 to 27 + SUSDS
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x1E6c22AAA11F507af12034A5Dc4126A6A25DC8d2", // LBTC <> BTC
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // scale LBTC to e27
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F", // BTC <> USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(29), // scale BTC to e27, and from USD to USDS
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x026a5B6114431d8F3eF2fA0E1B2EDdDccA9c540E", // SUSDS <> USDS Contract rate via Chainlink interface, returns rate in e27!!
      invertRate: true,
      multiplier: 1, // rate is already in e27
      divisor: 1,
    },
  ],
  // assume 1 USDS = 1 USD
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
