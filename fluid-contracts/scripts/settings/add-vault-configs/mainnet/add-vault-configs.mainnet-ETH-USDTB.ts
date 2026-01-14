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
const VAULT_QUEUE_COUNTER = 0; // #128

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = NATIVE_TOKEN.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDTB.address;

const ORACLE_CONFIG: GenericOracleConfig = {
  oracleName: "GenericOracle_ETH_USDTB",
  contractName: "FluidGenericOracle",
  infoName: "USDTB per 1 ETH",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH<>USD: https://data.chain.link/feeds/ethereum/mainnet/eth-usd returns price in 8 decimals
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // scale ETH to e27 (+9), adjust USD to USDTB (+10)
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
