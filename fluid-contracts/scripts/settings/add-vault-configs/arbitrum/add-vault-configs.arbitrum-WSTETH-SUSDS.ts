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
const VAULT_QUEUE_COUNTER = 1; // id 28

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WSTETH.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.SUSDS.address;

const ORACLE_CONFIG: GenericOracleL2Config = {
  oracleName: "GenericOracleL2_WSTETH_SUSDS",
  contractName: "FluidGenericOracleL2",
  infoName: "SUSDS per 1 WSTETH",
  targetDecimals: 27, // scale WSTETH 18 to 27 + SUSDS
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0xb523AE262D20A936BC152e6023996e46FDC2A95D", // WSTETH / ETH
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale WSTETH to e27
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", // ETH <> USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // scale ETH to e27 (+9), adjust USD to USDS (+10)
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x84AB0c8C158A1cD0d215BE2746cCa668B79cc287", // SUSDS <> USDS Contract rate via Chainlink interface, returns rate in e27!!
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
