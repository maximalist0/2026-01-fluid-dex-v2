import { FluidCappedRateBase } from "../../../../typechain-types/contracts/oracle/cappedRates/erc4626CappedRate.sol/FluidERC4626CappedRate";
import { CappedRatesConfigsUtils } from "../cappedRatesConfigsUtil";

// Chainlink EZETH-ETH Exchange Rate
// https://data.chain.link/feeds/arbitrum/mainnet/ezeth-eth-exchange-rate
const RATE_SOURCE = "0x989a480b6054389075CBCdC385C18CfB6FC08186";

export const CAPPED_RATES_PARAMS_ARBITRUM_EZETH: {
  params: FluidCappedRateBase.CappedRateConstructorParamsStruct;
  tokenSymbol: string;
  fullyQualifiedName: string;
} = {
  tokenSymbol: "EZETH",
  fullyQualifiedName: CappedRatesConfigsUtils.ChainlinkL2.fullyQualifiedName,
  params: {
    infoName: "ETH per 1 EZETH",
    rateSource: RATE_SOURCE,
    rateMultiplier: 1e9, // multiplier to get returned rate from rateSource to 1e27 precision
    maxAPRPercent: 15 * 1e4, // 1e4 = 1%
    maxDownFromMaxReachedPercentDebt: 2.5 * 1e4, // 1e4 = 1%
    // invertCenterPrice depends on token0 vs token1 at dex, center price must always be token1/token0.
    // e.g. for a EZETH / ETH dex, if EZETH is token0 and ETH would be token1 then we want ETH per 1 EZETH, so > 1, so not invert rate
    // but if EZETH would be token1 and ETH token0, we need EZETH per 1 ETH, so < 1, so invert rate.
    invertCenterPrice: false,

    // likely stay as defaults:
    minUpdateDiffPercent: 10, // 0.001%
    minHeartbeat: 25 * 60 * 60, // 25 hours

    // avoid forced liquidations should only be set to true after proper risk assessment.
    // 1. priority protect overall protocol (all users), 2. priority protect some users from potentially forced liquidations
    avoidForcedLiquidationsCol: false,
    maxDownFromMaxReachedPercentCol: 0, // not needed when avoid forced avoidForcedLiquidationsCol is set to false

    avoidForcedLiquidationsDebt: false,
    maxDebtUpCapPercent: 0, // not needed when avoid forced avoidForcedLiquidationsDebt is set to false

    liquidity: "IGNORE_ADDRESS_IS_FETCHED", // set automatically
  },
};
