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
  WstETHCLRSOracleConfig,
  WstETHCLRS2UniV3CheckCLRSOracleConfig,
  WeETHUniV3CheckCLRSOracleConfig,
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

const SUPPLY_TOKEN = TOKENS_MAINNET.WSTETH.address;
const SUPPLY_DECIMALS = TOKENS_MAINNET.WSTETH.decimals; // count of decimals
const SUPPLY_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(SUPPLY_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const BORROW_TOKEN = TOKENS_MAINNET.CBBTC.address;
const BORROW_DECIMALS = TOKENS_MAINNET.CBBTC.decimals; // count of decimals
const BORROW_DECIMALS_MULTIPLIER = BigNumber.from(10).pow(BORROW_DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

// rebalancer likely stays the same on all vaults. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const VAULT_CORE_SETTINGS: VaultCoreSettings = {
  // real values configured in IGP
  supplyRateMagnifier: 0 * PERCENT_PRECISION,
  borrowRateMagnifier: 0 * PERCENT_PRECISION,
  collateralFactor: 0 * PERCENT_PRECISION,
  liquidationThreshold: 0 * PERCENT_PRECISION,
  liquidationMaxLimit: 0 * PERCENT_PRECISION,
  withdrawGap: 0 * PERCENT_PRECISION,
  liquidationPenalty: 0 * PERCENT_PRECISION,
  borrowFee: 0,
};

// set to null to skip Rewards contract:
const VAULT_REWARDS = (vault: string) => null as any;

const VAULT_SUPPLY_CONFIG = (vault: string): AdminModuleStructs.UserSupplyConfigStruct => ({
  // real values configured in IGP
  baseWithdrawalLimit: SUPPLY_DECIMALS_MULTIPLIER.mul(0),
  expandDuration: 0, // 12hrs in seconds.
  expandPercent: 0, // in 1e2
  mode: MODE_WITH_INTEREST, // with interest.
  //
  token: SUPPLY_TOKEN, // SHOULD NOT CHANGE.
  user: vault, // SHOULD NOT CHANGE
});

// set to null to skip automated withdrawal limit expandPercentages on ExpandPercentConfigHandler:
const VAULT_WITHDRAW_LIMIT_CHECKPOINTS = null as any;

const VAULT_BORROW_CONFIG = (vault: string): AdminModuleStructs.UserBorrowConfigStruct => ({
  baseDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(0),
  maxDebtCeiling: BORROW_DECIMALS_MULTIPLIER.mul(0),
  expandDuration: 0,
  expandPercent: 0 * PERCENT_PRECISION,
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

// NOTE: SET CORRECT TYPE HERE WHEN CONFIGURING TO MAKE SURE CONFIG WILL BE VALID.
// if using an already deployed oracle, just set the "oracleName".
const ORACLE_CONFIG: WstETHCLRSOracleConfig = {
  oracleName: "WstETHCLRSOracle_WSTETH_CBBTC",
  contractName: "WstETHCLRSOracle",
  infoName: "CBBTC for 1 WSTETH",
  /// @param mainSource_          which oracle to use as main source:
  ///                                  - 1 = Chainlink ONLY (no fallback)
  ///                                  - 2 = Chainlink with Redstone Fallback
  ///                                  - 3 = Redstone with Chainlink Fallback
  wstETH: TOKENS_MAINNET.WSTETH.address,
  mainSource: 1,
  chainlinkParams: {
    hops: 2,
    feed1: {
      feed: "0x86392dC19c0b719886221c78AB11eb8Cf5c52812", // STETH <> ETH
      invertRate: false,
      token0Decimals: 18,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed2: {
      feed: "0xAc559F25B1619171CbC396a50854A3240b6A4e99", // ETH <> BTC
      invertRate: false,
      token0Decimals: 18,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed3: {
      feed: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
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
