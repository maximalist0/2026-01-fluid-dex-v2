import { BigNumber } from "ethers";
import { VAULT_TYPE } from "../config-utils";
import { TOKENS_POLYGON } from "../token-addresses";
import { GenericOracleConfig, GenericOracleSourceType } from "./add-vault-interfaces";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 1

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_POLYGON.WETH.address;
const BORROW_TOKEN = TOKENS_POLYGON.USDC.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_WETH_USDC",
  contractName: "FluidGenericOracle",
  infoName: "USDC per 1 WETH",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xF9680D99D6C9589e2a93a78A04A279e509205945", // ETH<>USD: https://data.chain.link/feeds/polygon/mainnet/eth-usd returns price in 8 decimals
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale ETH to e27 (+9), adjust USD to USDC (-2)
      divisor: 1e2,
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
