import { BigNumber, ethers } from "ethers";

import { MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { UniV3OracleImpl } from "../../../typechain-types/contracts/oracle/oracles/cLFallbackUniV3Oracle.sol/CLFallbackUniV3Oracle";
import {
  CLFallbackUniV3OracleConfig,
  CLRS2UniV3CheckCLRSOracleL2Config,
  FallbackCLRSOracleConfig,
  UniV3CheckCLRSOracleConfig,
  VaultCoreSettings,
} from "./add-vault-interfaces";
import { RESERVE_CONTRACT } from "../contract-addresses";
import { GOVERNANCE } from "../core-configs/core-configs";
import { Structs as ExpandPercentConfigHandlerStructs } from "../../../typechain-types/contracts/config/expandPercentHandler/main.sol/FluidExpandPercentConfigHandler";
import { VAULT_TYPE } from "../config-utils";
import { TOKENS_ARBITRUM, NATIVE_TOKEN } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 3; // id 21

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WEETH.address;
const BORROW_TOKEN = TOKENS_ARBITRUM.WBTC.address;

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const ORACLE_CONFIG: CLRS2UniV3CheckCLRSOracleL2Config = {
  oracleName: "CLRS2UniV3CheckCLRSOracleL2_WEETH_WBTC",
  contractName: "CLRS2UniV3CheckCLRSOracleL2",
  infoName: "WBTC for 1 WEETH",
  cLRS2Params: {
    // part 1: CL Oracle to go from WEETH -> ETH
    chainlinkParams: {
      hops: 1,
      feed1: {
        feed: "0xE141425bc1594b8039De6390db1cDaf4397EA22b", // WEETH / ETH
        invertRate: false,
        token0Decimals: 18,
      } as ChainlinkStructs.ChainlinkFeedDataStruct,
      feed2: {
        feed: ethers.constants.AddressZero,
        invertRate: false,
        token0Decimals: 0,
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
    /// @param fallbackMainSource         which oracle to use as main source:
    ///                                  - 1 = Chainlink ONLY (no fallback)
    ///                                  - 2 = Chainlink with Redstone Fallback
    ///                                  - 3 = Redstone with Chainlink Fallback
    fallbackMainSource: 1,
  },
  uniV3CheckCLRSParams: {
    // part 2: univ3 checked against CL oracle for ETH -> WBTC
    chainlinkParams: {
      // USD pair has higher precision for trigger paramters than WBTC<>BTC combined with BTC<>ETH
      hops: 2,
      feed1: {
        feed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", // ETH <> USD
        invertRate: false,
        token0Decimals: 18,
      } as ChainlinkStructs.ChainlinkFeedDataStruct,
      feed2: {
        feed: "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57", // WBTC <> USD
        invertRate: true,
        token0Decimals: 8,
      } as ChainlinkStructs.ChainlinkFeedDataStruct,
      feed3: {
        feed: ethers.constants.AddressZero,
        invertRate: false,
        token0Decimals: 0,
      } as ChainlinkStructs.ChainlinkFeedDataStruct,
    } as ChainlinkStructs.ChainlinkConstructorParamsStruct,
    uniV3Params: {
      pool: "0x2f5e87C9312fa29aed5c179E456625D79015299c", // WBTC <> ETH
      secondsAgos: [240, 60, 15, 1, 0],
      tWAPMaxDeltaPercents: [
        2 * PERCENT_PRECISION, // max 2% delta for first interval <> current price (240->60)
        0.5 * PERCENT_PRECISION, // max 0.5% delta for second interval <> current price (60->15)
        0.2 * PERCENT_PRECISION, // max 0.2% delta for third interval <> current price (15->1)
      ],
      invertRate: true,
    } as UniV3OracleImpl.UniV3ConstructorParamsStruct,
    redstoneOracle: {
      // Redstone Oracle data.(address can be set to zero address if using Chainlink only)
      oracle: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    } as RedstoneStructs.RedstoneOracleDataStruct,
    // which oracle to use as final rate source: 1 = UniV3 ONLY (no check), 2 = UniV3 with Chainlink / Redstone check, 3 = Chainlink / Redstone with UniV3 used as check.
    rateSource: 2,
    /// @param fallbackMainSource         which oracle to use as main source:
    ///                                  - 1 = Chainlink ONLY (no fallback)
    ///                                  - 2 = Chainlink with Redstone Fallback
    ///                                  - 3 = Redstone with Chainlink Fallback
    fallbackMainSource: 1,
    rateCheckMaxDeltaPercent: 3 * PERCENT_PRECISION, // max 3% delta for Chainlink <> UniV3 price
  },
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
