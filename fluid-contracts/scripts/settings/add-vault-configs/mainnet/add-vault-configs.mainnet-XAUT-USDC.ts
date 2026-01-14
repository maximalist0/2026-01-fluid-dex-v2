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
const VAULT_QUEUE_COUNTER = 0; // id 116

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.XAUT.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDC.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_XAUT_USDC",
  contractName: "FluidGenericOracle",
  infoName: "USDC per 1 XAUT",
  targetDecimals: 27, // scale XAUT 6 to 27 + USDC
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6", // XAU<>USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(21), // scale XAUT to e27 (+21), adjust USD to USDC (-2)
      divisor: 1e2,
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
