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
const VAULT_QUEUE_COUNTER = 3;

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.WEETH.address;
const BORROW_TOKEN = TOKENS_MAINNET.GHO.address;

const ORACLE_CONFIG: FallbackCLRSOracleConfig = {
  oracleName: "FallbackCLRSOracle_WEETH_GHO",
  contractName: "FallbackCLRSOracle",
  infoName: "GHO per 1 WEETH",
  /// @param mainSource_          which oracle to use as main source:
  ///                                  - 1 = Chainlink ONLY (no fallback)
  ///                                  - 2 = Chainlink with Redstone Fallback
  ///                                  - 3 = Redstone with Chainlink Fallback
  mainSource: 1,
  chainlinkParams: {
    hops: 3,
    feed1: {
      feed: "0x5c9C449BbC9a6075A2c061dF312a35fd1E05fF22", // WEETH <> ETH
      invertRate: false,
      token0Decimals: 18,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed2: {
      feed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH <> USD
      invertRate: false,
      token0Decimals: 18,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed3: {
      feed: "0x3f12643D3f6f874d39C2a4c9f2Cd6f2DbAC877FC", // GHO <> USD
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
