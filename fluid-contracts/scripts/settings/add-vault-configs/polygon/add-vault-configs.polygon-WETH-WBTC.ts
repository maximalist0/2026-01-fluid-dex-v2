import { BigNumber, ethers } from "ethers";

import { VAULT_TYPE } from "../config-utils";
import { NATIVE_TOKEN, TOKENS_POLYGON } from "../token-addresses";
import { GenericOracleSourceType, GenericOracleConfig } from "./add-vault-interfaces";
// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 1; // id 12

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_POLYGON.WETH.address;
const BORROW_TOKEN = TOKENS_POLYGON.WBTC.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_WETH_WBTC",
  contractName: "FluidGenericOracle",
  infoName: "WBTC per 1 WETH",
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
      source: "0xc907E116054Ad103354f2D350FD2514433D57F6f", // BTC<>USD: https://data.chain.link/feeds/polygon/mainnet/btc-usd returns price in 8 decimals
      invertRate: true,
      multiplier: BigNumber.from(10).pow(19), // scale BTC to e27
      divisor: 1,
    },
  ],
};

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//

export const addVaultConfigs = () => ({
  vaultType: VAULTTYPE,
  addToVaultIdCounter: VAULT_QUEUE_COUNTER,
  supplyToken: SUPPLY_TOKEN,
  borrowToken: BORROW_TOKEN,
  oracle: ORACLE_CONFIG,
});
//#endregion
