import { ethers, BigNumber } from "ethers";

import { NATIVE_TOKEN, TOKENS_MAINNET, TOKENS_ARBITRUM } from "../token-addresses";
import {
  GenericOracleConfig,
  GenericOracleL2Config,
  GenericOracleSourceType,
  GenericUniV3CheckedOracleConfig,
} from "./add-vault-interfaces";
import { VAULT_TYPE } from "../config-utils";
import { PERCENT_PRECISION } from "../config-utils";
import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { UniV3OracleImpl } from "../../../typechain-types/contracts/oracle/oracles/cLFallbackUniV3Oracle.sol/CLFallbackUniV3Oracle";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // #45

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WSTUSR.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.USDC.address;

const ORACLE_CONFIG: GenericOracleL2Config = {
  oracleName: "GenericOracleL2_WSTUSR_USDC",
  contractName: "FluidGenericOracleL2",
  infoName: "USDC per 1 WSTUSR",
  sources: [
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0xd86F76B2DCcb74090dF88F89a6A27407041DF425", // FluidCappedRate WSTUSR
      invertRate: false,
      multiplier: 1,
      divisor: 1e12, // scale e27 capped rate to e15
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
