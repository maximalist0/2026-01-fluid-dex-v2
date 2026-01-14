import { BigNumber, ethers } from "ethers";

import { MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { UniV3OracleImpl } from "../../../typechain-types/contracts/oracle/oracles/cLFallbackUniV3Oracle.sol/CLFallbackUniV3Oracle";
import {
  CLFallbackUniV3OracleConfig,
  FallbackCLRSOracleConfig,
  UniV3CheckCLRSOracleConfig,
  VaultCoreSettings,
  CLRS2UniV3CheckCLRSOracleL2Config,
} from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_ARBITRUM } from "../token-addresses";
import { RESERVE_CONTRACT } from "../contract-addresses";
import { GOVERNANCE } from "../core-configs/core-configs";
import { Structs as ExpandPercentConfigHandlerStructs } from "../../../typechain-types/contracts/config/expandPercentHandler/main.sol/FluidExpandPercentConfigHandler";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0;

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WSTETH.address;
const SUPPLY_DECIMALS = TOKENS_ARBITRUM.WSTETH.decimals; // count of decimals
const SUPPLY_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(SUPPLY_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const BORROW_TOKEN = TOKENS_ARBITRUM.USDT.address; // USDT
const BORROW_DECIMALS = TOKENS_ARBITRUM.USDT.decimals; // count of decimals
const BORROW_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(BORROW_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

// rebalancer likely stays the same on all vaults. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const VAULT_CORE_SETTINGS: VaultCoreSettings = {
  supplyRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  borrowRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  collateralFactor: 78 * PERCENT_PRECISION,
  liquidationThreshold: 85 * PERCENT_PRECISION,
  liquidationMaxLimit: 90 * PERCENT_PRECISION,
  withdrawGap: 5 * PERCENT_PRECISION,
  liquidationPenalty: 3 * PERCENT_PRECISION,
  borrowFee: 0,
};

// set to null to skip Rewards contract:
const VAULT_REWARDS = (vault: string) => null as any;

const VAULT_SUPPLY_CONFIG = (vault: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  baseWithdrawalLimit: SUPPLY_DECIMALS_MULTIPLIER.mul(2_230), // 2_230 WSTETH = ~7.5M USD @ 1WSTETH = 3350
  expandDuration: 60 * 60 * 12, // 12hrs in seconds.
  expandPercent: 20 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: SUPPLY_TOKEN, // SHOULD NOT CHANGE.
  user: vault, // SHOULD NOT CHANGE
});

// set to null to skip automated withdrawal limit expandPercentages on ExpandPercentConfigHandler:
const VAULT_WITHDRAW_LIMIT_CHECKPOINTS = null as any;

const VAULT_BORROW_CONFIG = (vault: string): AdminModuleStructs.UserBorrowConfigStruct => ({
  baseDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(7_500_000), // 7.5M USDT
  maxDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(200_000_000), // 200M USDT
  expandDuration: 60 * 60 * 12, // 12hrs in seconds.
  expandPercent: 20 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: BORROW_TOKEN, // SHOULD NOT CHANGE
  user: vault, // SHOULD NOT CHANGE
});

// set to null to skip automated borrow limit expandPercentages on ExpandPercentConfigHandler:
const VAULT_BORROW_LIMIT_CHECKPOINTS = null as any;

// oracle config must be a valid config from interface from see `add-vault-interfaces.ts`

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const ORACLE_CONFIG: CLRS2UniV3CheckCLRSOracleL2Config = {
  oracleName: "CLRS2UniV3CheckCLRSOracleL2_WSTETH_USDT",
  contractName: "CLRS2UniV3CheckCLRSOracleL2",
  infoName: "USDT for 1 WSTETH",
  cLRS2Params: {
    // part 1: CL Oracle to go from WSTETH -> ETH
    chainlinkParams: {
      hops: 1,
      feed1: {
        feed: "0xb523AE262D20A936BC152e6023996e46FDC2A95D", // WSTETH / ETH
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
    // part 2: univ3 checked against CL oracle for ETH -> USDT
    chainlinkParams: {
      hops: 2,
      feed1: {
        feed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", // ETH <> USD
        invertRate: false,
        token0Decimals: 18,
      } as ChainlinkStructs.ChainlinkFeedDataStruct,
      feed2: {
        feed: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7", // USDT / USD
        invertRate: true,
        token0Decimals: 6,
      } as ChainlinkStructs.ChainlinkFeedDataStruct,
      feed3: {
        feed: ethers.constants.AddressZero,
        invertRate: false,
        token0Decimals: 0,
      } as ChainlinkStructs.ChainlinkFeedDataStruct,
    } as ChainlinkStructs.ChainlinkConstructorParamsStruct,
    uniV3Params: {
      pool: "0xC6962004f452bE9203591991D15f6b388e09E8D0", // ETH <> USDC (on purpose USDC because of more liquidity)
      secondsAgos: [240, 60, 15, 1, 0],
      tWAPMaxDeltaPercents: [
        2 * PERCENT_PRECISION, // max 2% delta for first interval <> current price (240->60)
        0.5 * PERCENT_PRECISION, // max 0.5% delta for second interval <> current price (60->15)
        0.2 * PERCENT_PRECISION, // max 0.2% delta for third interval <> current price (15->1)
      ],
      invertRate: false,
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
  addToVaultIdCounter: VAULT_QUEUE_COUNTER,
  supplyToken: SUPPLY_TOKEN,
  borrowToken: BORROW_TOKEN,
  oracle: ORACLE_CONFIG,
  vault: {
    coreSettings: VAULT_CORE_SETTINGS,
    supplyConfig: VAULT_SUPPLY_CONFIG,
    borrowConfig: VAULT_BORROW_CONFIG,
    rebalancer: REBALANCER,
  },
  configHandler: {
    withdrawLimitCheckpoints: VAULT_WITHDRAW_LIMIT_CHECKPOINTS,
    borrowLimitCheckpoints: VAULT_BORROW_LIMIT_CHECKPOINTS,
  },
  rewards: VAULT_REWARDS,
});
//#endregion
