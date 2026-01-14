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
  Ratio2xFallbackCLRSOracleL2Config,
  UniV3CheckCLRSOracleConfig,
  VaultCoreSettings,
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

const SUPPLY_TOKEN = TOKENS_ARBITRUM.WEETH.address;
const SUPPLY_DECIMALS = TOKENS_ARBITRUM.WEETH.decimals; // count of decimals
const SUPPLY_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(SUPPLY_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const BORROW_TOKEN = TOKENS_ARBITRUM.WSTETH.address;
const BORROW_DECIMALS = TOKENS_ARBITRUM.WSTETH.decimals; // count of decimals
const BORROW_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(BORROW_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

// rebalancer likely stays the same on all vaults. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const VAULT_CORE_SETTINGS: VaultCoreSettings = {
  supplyRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  borrowRateMagnifier: 100 * PERCENT_PRECISION, // = 1
  collateralFactor: 93 * PERCENT_PRECISION,
  liquidationThreshold: 95 * PERCENT_PRECISION,
  liquidationMaxLimit: 98 * PERCENT_PRECISION,
  withdrawGap: 5 * PERCENT_PRECISION,
  liquidationPenalty: 0.1 * PERCENT_PRECISION,
  borrowFee: 0,
};

// set to null to skip Rewards contract:
const VAULT_REWARDS = (vault: string) => null as any;

const VAULT_SUPPLY_CONFIG = (vault: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  baseWithdrawalLimit: SUPPLY_DECIMALS_MULTIPLIER.mul(2_540), // 2_540 WEETH = ~7.5M USD @ 1WEETH = 2950
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
  baseDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(2_230), // 2_000 WSTETH = ~7.5M USD @ 1WSTETH = 3350
  maxDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(59_700), // 59_700 WSTETH = ~200M USD @ 1WSTETH = 3350
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
const ORACLE_CONFIG: Ratio2xFallbackCLRSOracleL2Config = {
  oracleName: "Ratio2xFallbackCLRSOracleL2_WEETH_WSTETH",
  contractName: "Ratio2xFallbackCLRSOracleL2",
  infoName: "WSTETH for 1 WEETH",
  cLRSParams1: {
    chainlinkParams: {
      hops: 1,
      feed1: {
        feed: "0x20bAe7e1De9c596f5F7615aeaa1342Ba99294e12", // WEETH <> eETH (contract exchange rate)
        invertRate: false,
        token0Decimals: 18, // e.g. 1042139955645944153
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
      // see feeds https://docs.redstone.finance/docs/smart-contract-devs/price-feeds
      // oracle: "0x119A190b510c9c0D5Ec301b60B2fE70A50356aE9", // WEETH <> eETH (contract exchange rate)
      // invertRate: false,
      // token0Decimals: 8, // for some reason this comes in at 8 decimals. Maybe Redstone default? e.g. 104221562.
      // Redstone Oracle data.(address can be set to zero address if using Chainlink only)
      // see feeds https://docs.redstone.finance/docs/smart-contract-devs/price-feeds
      oracle: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    } as RedstoneStructs.RedstoneOracleDataStruct,
    /// @param mainSource         which oracle to use as main source:
    ///                           - 1 = Chainlink ONLY (no fallback)
    ///                           - 2 = Chainlink with Redstone Fallback
    ///                           - 3 = Redstone with Chainlink Fallback
    mainSource: 1,
  },
  cLRSParams2: {
    chainlinkParams: {
      hops: 1,
      feed1: {
        feed: "0xB1552C5e96B312d0Bf8b554186F846C40614a540", // WSTETH <> STETH (contract exchange rate)
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
      // see feeds https://docs.redstone.finance/docs/smart-contract-devs/price-feeds
      oracle: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    } as RedstoneStructs.RedstoneOracleDataStruct,
    /// @param mainSource         which oracle to use as main source:
    ///                           - 1 = Chainlink ONLY (no fallback)
    ///                           - 2 = Chainlink with Redstone Fallback
    ///                           - 3 = Redstone with Chainlink Fallback
    mainSource: 1,
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
