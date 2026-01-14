import { VAULT_TYPE } from "../config-utils";
import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { FallbackCLRSOracleConfig } from "./add-vault-interfaces";
import { TOKENS_ARBITRUM } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 2; // id 14

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.CBBTC.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.USDC.address;

const ORACLE_CONFIG: FallbackCLRSOracleConfig = {
  oracleName: "FallbackCLRSOracleL2_CBBTC_USDC",
  contractName: "FallbackCLRSOracleL2",
  infoName: "USDC for 1 CBBTC",
  chainlinkParams: {
    hops: 2,
    feed1: {
      feed: "0x6ce185860a4963106506C203335A2910413708e9", // BTC <> USD
      invertRate: false,
      token0Decimals: 8,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed2: {
      feed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3", // USDC / USD
      invertRate: true,
      token0Decimals: 6,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed3: {
      feed: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
  } as ChainlinkStructs.ChainlinkConstructorParamsStruct,
  redstoneOracle: {
    // Redstone Oracle data.(address can be set to zero address if using Chainlink only)
    oracle: ethers.constants.AddressZero,
    invertRate: false,
    token0Decimals: 0,
  } as RedstoneStructs.RedstoneOracleDataStruct,
  /// @param mainSource         which oracle to use as main source:
  ///                           - 1 = Chainlink ONLY (no fallback)
  ///                           - 2 = Chainlink with Redstone Fallback
  ///                           - 3 = Redstone with Chainlink Fallback
  mainSource: 1,
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
