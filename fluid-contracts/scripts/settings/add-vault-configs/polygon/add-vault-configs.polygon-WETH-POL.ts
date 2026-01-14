import { BigNumber, ethers } from "ethers";

import { VAULT_TYPE } from "../config-utils";
import { NATIVE_TOKEN, TOKENS_POLYGON } from "../token-addresses";
import { GenericOracleConfig, GenericOracleSourceType } from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 5; // id 6

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_POLYGON.WETH.address;
const BORROW_TOKEN = NATIVE_TOKEN.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_WETH_POL",
  contractName: "FluidGenericOracle",
  infoName: "POL per 1 WETH",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xF9680D99D6C9589e2a93a78A04A279e509205945", // ETH<>USD: https://data.chain.link/feeds/polygon/mainnet/eth-usd returns price in 8 decimals
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale ETH to e27
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0", // MATIC<>USD: https://data.chain.link/feeds/polygon/mainnet/matic-usd returns price in 8 decimals
      invertRate: true,
      multiplier: BigNumber.from(10).pow(9), // scale POL to e27
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
