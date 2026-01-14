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
const VAULT_QUEUE_COUNTER = 2; // 53

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.SYRUPUSDC.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.GHO.address;

const ORACLE_CONFIG: GenericOracleL2Config = {
  oracleName: "GenericOracleL2_SYRUPUSDC_GHO",
  contractName: "FluidGenericOracleL2",
  infoName: "GHO per 1 SYRUPUSDC",
  sources: [
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0x4818676467Cc95b6279ff68BC416877227380ad4", // FluidCappedRate SYRUPUSDC
      invertRate: false,
      multiplier: 1e12,
      divisor: 1,
    },
  ],
  targetDecimals: 39,
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
