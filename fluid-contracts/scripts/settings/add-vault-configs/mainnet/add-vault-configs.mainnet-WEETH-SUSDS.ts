import { ethers, BigNumber } from "ethers";

import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
import { GenericOracleConfig, GenericOracleSourceType, GenericUniV3CheckedOracleConfig } from "./add-vault-interfaces";
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
const VAULT_QUEUE_COUNTER = 4; // id 91

const VAULTTYPE = VAULT_TYPE.T1;

const SUPPLY_TOKEN = TOKENS_MAINNET.WEETH.address;
const BORROW_TOKEN = TOKENS_MAINNET.SUSDS.address;

const ORACLE_CONFIG: GenericUniV3CheckedOracleConfig = {
  oracleName: "GenericUniV3CheckedOracle_WEETH_SUSDS",
  contractName: "FluidGenericUniV3CheckedOracle",
  infoName: "SUSDS per 1 WEETH",
  sources: [
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x5c9C449BbC9a6075A2c061dF312a35fd1E05fF22", // WEETH <> ETH
      invertRate: false,
      multiplier: BigNumber.from(10).pow(9), // scale token 0 WEETH to 27
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.UniV3Checked, // ETH<>USDC see uniV3Params below
      source: ethers.constants.AddressZero,
      invertRate: false,
      multiplier: 1, // scale to 27
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Chainlink,
      source: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6", // USDC<>USD
      invertRate: false,
      multiplier: BigNumber.from(10).pow(31), // scale token 0 USDC to 27, but then we have 1e8 USD, scaling to USDS which is 1e18, so * 1e10
      divisor: 1,
    },
    {
      sourceType: GenericOracleSourceType.Fluid,
      source: "0x23F966DE6C008601972A8057B5767F70E91Cf66F", // SUSDS<>USDS contract rate
      invertRate: true,
      multiplier: 1, // scale to 27
      divisor: 1,
    },
  ],
  uniV3Params: {
    chainlinkParams: {
      hops: 1,
      feed1: {
        feed: "0x986b5e1e1755e3c2440e960477f25201b0a8bbd4", // USDC <> ETH
        invertRate: true,
        token0Decimals: 6,
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
    uniV3Params: {
      pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // USDC <> ETH
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
