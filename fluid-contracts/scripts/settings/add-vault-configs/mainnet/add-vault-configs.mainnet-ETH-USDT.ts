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
} from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";
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

const SUPPLY_TOKEN = NATIVE_TOKEN.address; // native ETH
const SUPPLY_DECIMALS = NATIVE_TOKEN.decimals; // count of decimals
const SUPPLY_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(SUPPLY_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const BORROW_TOKEN = TOKENS_MAINNET.USDT.address; // USDT
const BORROW_DECIMALS = TOKENS_MAINNET.USDT.decimals; // count of decimals
const BORROW_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(BORROW_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

// rebalancer likely stays the same on all vaults. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const VAULT_CORE_SETTINGS: VaultCoreSettings = {
  supplyRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  borrowRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  collateralFactor: 85 * PERCENT_PRECISION,
  liquidationThreshold: 90 * PERCENT_PRECISION,
  liquidationMaxLimit: 95 * PERCENT_PRECISION,
  withdrawGap: 5 * PERCENT_PRECISION,
  liquidationPenalty: 2 * PERCENT_PRECISION,
  borrowFee: 0,
};

// set to null to skip Rewards contract:
// const VAULT_REWARDS = (vault: string) => null as any;
const VAULT_REWARDS = (vault: string) => ({
  duration: 60 * 60 * 24 * 85, // 85 days (originally 90 days)
  rewardsAmount: SUPPLY_DECIMALS_MULTIPLIER.mul(20777).div(100), // 207.77 left after 5 days (originally 220 ETH = ~620k USDT at 1 ETH = 2.800 USDT.)
  initiator: GOVERNANCE,
  //
  vault, // SHOULD NOT CHANGE
});

const VAULT_SUPPLY_CONFIG = (vault: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  baseWithdrawalLimit: SUPPLY_DECIMALS_MULTIPLIER.mul(2650), // 2650ETH = ~7.5M USDT at 1 ETH = 2.810 USDT
  expandDuration: 60 * 60 * 12, // 12hrs in seconds.
  expandPercent: 25 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: SUPPLY_TOKEN, // SHOULD NOT CHANGE.
  user: vault, // SHOULD NOT CHANGE
});

// set to null to skip automated withdrawal limit expandPercentages on ExpandPercentConfigHandler:
// const VAULT_WITHDRAW_LIMIT_CHECKPOINTS = null as any;
const VAULT_WITHDRAW_LIMIT_CHECKPOINTS: ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct = {
  // all expandPercent values in 1e2. tvlCheckPoint values in supply token decimals.
  tvlCheckPoint1: SUPPLY_DECIMALS_MULTIPLIER.mul(7060), // 7060ETH = ~20M USDT at 1 ETH = 2.810 USDT
  expandPercentUntilCheckPoint1: 25 * PERCENT_PRECISION, // e.g. 25%
  tvlCheckPoint2: SUPPLY_DECIMALS_MULTIPLIER.mul(10600), // 10600ETH = ~30M USDT at 1 ETH = 2.810 USDT
  expandPercentUntilCheckPoint2: 20 * PERCENT_PRECISION, // e.g. 20%
  tvlCheckPoint3: SUPPLY_DECIMALS_MULTIPLIER.mul(14120), // 14120ETH = ~40M USDT at 1 ETH = 2.810 USDT
  expandPercentUntilCheckPoint3: 15 * PERCENT_PRECISION, // e.g. 15%
  expandPercentAboveCheckPoint3: 10 * PERCENT_PRECISION, // e.g. 10%
};

const VAULT_BORROW_CONFIG = (vault: string): AdminModuleStructs.UserBorrowConfigStruct => ({
  baseDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(7_500_000), // 7.5M USDT
  maxDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(200_000_000), // 200M USDT
  expandDuration: 60 * 60 * 12, // 12hrs in seconds.
  expandPercent: 25 * PERCENT_PRECISION, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: BORROW_TOKEN, // SHOULD NOT CHANGE
  user: vault, // SHOULD NOT CHANGE
});

// set to null to skip automated borrow limit expandPercentages on ExpandPercentConfigHandler:
// const VAULT_BORROW_LIMIT_CHECKPOINTS = null as any;
const VAULT_BORROW_LIMIT_CHECKPOINTS: ExpandPercentConfigHandlerStructs.LimitCheckPointsStruct = {
  // all expandPercent values in 1e2. tvlCheckPoint values in borrow token decimals.
  tvlCheckPoint1: BORROW_DECIMALS_MULTIPLIER.mul(20_000_000), // e.g. 20M
  expandPercentUntilCheckPoint1: 25 * PERCENT_PRECISION, // e.g. 25%
  tvlCheckPoint2: BORROW_DECIMALS_MULTIPLIER.mul(30_000_000), // e.g. 30M
  expandPercentUntilCheckPoint2: 20 * PERCENT_PRECISION, // e.g. 20%
  tvlCheckPoint3: BORROW_DECIMALS_MULTIPLIER.mul(40_000_000), // e.g. 40M
  expandPercentUntilCheckPoint3: 15 * PERCENT_PRECISION, // e.g. 15%
  expandPercentAboveCheckPoint3: 10 * PERCENT_PRECISION, // e.g. 10%
};

// oracle config must be a valid config from interface from see `add-vault-interfaces.ts`

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const ORACLE_CONFIG: UniV3CheckCLRSOracleConfig = {
  oracleName: "UniV3CheckCLRSOracle_ETH_USDT",
  contractName: "UniV3CheckCLRSOracle",
  params: {
    chainlinkParams: {
      hops: 1,
      feed1: {
        feed: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46", // USDT <> ETH
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
      pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // USDC <> ETH (on purpose USDC because of more liquidity)
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
