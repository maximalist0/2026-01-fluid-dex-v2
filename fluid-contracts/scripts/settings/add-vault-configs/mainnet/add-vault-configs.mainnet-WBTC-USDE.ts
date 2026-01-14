import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { FallbackCLRSOracleConfig } from "./add-vault-interfaces";
import { VAULT_TYPE } from "../config-utils";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 6; // id 72

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.WBTC.address;
const BORROW_TOKEN = TOKENS_MAINNET.USDE.address;

const ORACLE_CONFIG: FallbackCLRSOracleConfig = {
  oracleName: "FallbackCLRSOracle_WBTC_USDE",
  contractName: "FallbackCLRSOracle",
  infoName: "USDE per 1 WBTC",
  /// @param mainSource_          which oracle to use as main source:
  ///                                  - 1 = Chainlink ONLY (no fallback)
  ///                                  - 2 = Chainlink with Redstone Fallback
  ///                                  - 3 = Redstone with Chainlink Fallback
  mainSource: 1,
  chainlinkParams: {
    hops: 3,
    feed1: {
      feed: "0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23", // WBTC <> BTC
      invertRate: false,
      token0Decimals: 8,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed2: {
      feed: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC <> USD
      invertRate: false,
      token0Decimals: 8,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed3: {
      feed: "0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961", // USDE <> USD
      invertRate: true,
      token0Decimals: 18,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
  } as ChainlinkStructs.ChainlinkConstructorParamsStruct,
  redstoneOracle: {
    // Redstone Oracle data. (address can be set to zero address if using Chainlink only)
    oracle: ethers.constants.AddressZero,
    invertRate: false,
    token0Decimals: 0,
  } as RedstoneStructs.RedstoneOracleDataStruct,
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
