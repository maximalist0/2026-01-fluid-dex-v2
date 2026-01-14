import { BigNumber } from "ethers";

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
const VAULT_QUEUE_COUNTER = 1; // id 15

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_POLYGON.MATICX.address;
const BORROW_TOKEN = TOKENS_POLYGON.USDT.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_MATICX_USDT",
  contractName: "FluidGenericOracle",
  infoName: "USDT per 1 MATICX",
  targetDecimals: 15,
  sources: [
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0x7F8E0be00A22b251eee9a70d17Ec2980354543A8", // FluidCappedRate for MaticX<>Matic
      invertRate: false,
      multiplier: 1,
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0", // MATIC<>USD: https://data.chain.link/feeds/polygon/mainnet/matic-usd returns price in 8 decimals
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale POL to e27 (+9), adjust USD to USDT (-2)
      divisor: 1e2,
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
