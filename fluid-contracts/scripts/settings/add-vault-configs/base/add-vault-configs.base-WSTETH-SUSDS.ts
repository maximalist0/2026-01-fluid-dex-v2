import { ethers, BigNumber } from "ethers";

import { NATIVE_TOKEN, TOKENS_MAINNET, TOKENS_BASE } from "../token-addresses";
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
const VAULT_QUEUE_COUNTER = 1; // #18

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_BASE.WSTETH.address;
const BORROW_TOKEN = TOKENS_BASE.SUSDS.address;

const ORACLE_CONFIG: GenericOracleL2Config = {
  oracleName: "GenericOracleL2_WSTETH_SUSDS",
  contractName: "FluidGenericOracleL2",
  infoName: "SUSDS per 1 WSTETH",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x43a5C292A453A3bF3606fa856197f09D7B74251a", // WSTETH <> ETH
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale WSTETH to e27
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70", // ETH <> USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(19), // scale ETH to e27, and from USD to USDS
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x026a5B6114431d8F3eF2fA0E1B2EDdDccA9c540E", // SUSDS <> USDS Contract rate via Chainlink interface, returns rate in e27!!
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
