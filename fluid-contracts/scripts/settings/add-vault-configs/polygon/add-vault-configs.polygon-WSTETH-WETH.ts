import { BigNumber } from "ethers";

import { VAULT_TYPE } from "../config-utils";
import { TOKENS_POLYGON } from "../token-addresses";
import { GenericOracleSourceType, GenericOracleConfig } from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 4; // id 5

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_POLYGON.WSTETH.address;
const BORROW_TOKEN = TOKENS_POLYGON.WETH.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_WSTETH_WETH",
  contractName: "FluidGenericOracle",
  infoName: "WETH per 1 WSTETH",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x3Ea1eC855fBda8bA0396975eC260AD2e9B2Bc01c", // WSTETH<>STETH: https://data.chain.link/feeds/polygon/mainnet/wsteth-steth contract exchange rate returns price in 18 decimals
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale WSTETH to e27
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
