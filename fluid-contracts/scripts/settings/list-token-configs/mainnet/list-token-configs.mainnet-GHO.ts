import { BigNumber, constants } from "ethers";

import { MODE_WITH_INTEREST, PERCENT_PRECISION } from "../config-utils";
import { Structs as AdminModuleStructs } from "../../../typechain-types/contracts/liquidity/adminModule/main.sol/FluidLiquidityAdminModule";
import { TOKENS_MAINNET } from "../token-addresses";
import { AVOCADO_TEAM_MULTISIG, RESERVE_CONTRACT } from "../contract-addresses";
import { GOVERNANCE, PROD_GOVERNANCE_TIMELOCK } from "../core-configs/core-configs";
import { Structs as ExpandPercentConfigHandlerStructs } from "../../../typechain-types/contracts/config/expandPercentHandler/main.sol/FluidExpandPercentConfigHandler";

// ----------------------------------------------------------
//
//    @dev FOR LISTING A TOKEN, MUST CONFIGURE VARIABLES BELOW:
//
//  !! PAY ATTENTION TO DIFFERENT REGIONS DEPENDING ON LISTING NATIVE, WRAPPED NATIVE, OR NORMAL ERC20 !!
//
// ----------------------------------------------------------

const TOKEN = TOKENS_MAINNET.GHO.address; // GHO on Mainnet
const DECIMALS = TOKENS_MAINNET.GHO.decimals; // count of decimals
const DECIMALS_MULTIPLIER = BigNumber.from(10).pow(DECIMALS); // actual value used to multiply, e.g. 1e18. Should be fine as calculated.

const LIQUIDITY_RATE_DATA: AdminModuleStructs.RateDataV1ParamsStruct | AdminModuleStructs.RateDataV2ParamsStruct = null;
const LIQUIDITY_TOKEN_CONFIG: AdminModuleStructs.TokenConfigStruct = null;

//#region IF IS NATIVE
// BELOW CONFIG FOR STETH PROTOCOL IS ONLY NEEDED FOR NATIVE TOKEN (ETH) AS IT BORROWS ETH
const STETH_BORROW_CONFIG = null as any;
//#endregion

//#region IF NOT NATIVE
// BELOW CONFIG FOR iTOKEN NOT NEEDED FOR LISTING NATIVE TOKEN (is part of wrapped native token listing instead).

// rebalancer likely stays the same on all fTokens. Set to reserve contract. Set to address zero to skip setting.
const REBALANCER = RESERVE_CONTRACT;

const IS_FTOKEN_NATIVE = false; // set to true if the listing token is WETH (WMATIC) etc.

const FTOKEN_SUPPLY_CONFIG = null;

// set to null to skip automated withdrawal limit expandPercentages on ExpandPercentConfigHandler:
// const FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS = null as any;
const FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS = null;

// set to null to skip LendingRewardsRateModel:
const LENDING_REWARDS_RATE_MODEL = {
  duration: 60 * 60 * 24 * 90, // 90 days starting at ~Dec 11
  startTvl: DECIMALS_MULTIPLIER.mul(1_000), // start at 1000 GHO
  rewardAmount: DECIMALS_MULTIPLIER.mul(210000), // 210_000 GHO for 90 days
  initiator: PROD_GOVERNANCE_TIMELOCK,
  previousModel: constants.AddressZero,
};

// set to null to skip INST StakingRewards (rewards in INST):
const STAKING_REWARDS = (fTokenAddress: string) => null as any;
//#endregion

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const listTokenConfigs = () => ({
  token: TOKEN,
  decimals: DECIMALS,
  liquidity: {
    rateData: LIQUIDITY_RATE_DATA,
    tokenConfig: LIQUIDITY_TOKEN_CONFIG,
  },
  lending: {
    // not needed when listing native ETH
    isNativeUnderlying: IS_FTOKEN_NATIVE,
    lendingRewardsRateModel: LENDING_REWARDS_RATE_MODEL,
    stakingRewards: STAKING_REWARDS,
    fToken: {
      supplyConfig: FTOKEN_SUPPLY_CONFIG,
      rebalancer: REBALANCER,
      configHandler: {
        withdrawLimitCheckpoints: FTOKEN_WITHDRAW_LIMIT_CHECKPOINTS,
      },
    },
  },
  steth: {
    borrowConfig: STETH_BORROW_CONFIG, // only needed when listing native ETH
  },
});
//#endregion
