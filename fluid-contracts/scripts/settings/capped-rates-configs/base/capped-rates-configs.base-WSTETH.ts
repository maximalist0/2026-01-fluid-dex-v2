import { FluidCappedRateBase } from "../../../../typechain-types/contracts/oracle/cappedRates/erc4626CappedRate.sol/FluidERC4626CappedRate";
import { CappedRatesConfigsUtils } from "../cappedRatesConfigsUtil";

// Chainlink wstETH-stETH Exchange Rate
// https://data.chain.link/feeds/base/base/wsteth-steth%20exchangerate
const RATE_SOURCE = "0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061";

export const CAPPED_RATES_PARAMS_BASE_WSTETH: {
  params: FluidCappedRateBase.CappedRateConstructorParamsStruct;
  tokenSymbol: string;
  fullyQualifiedName: string;
} = {
  tokenSymbol: "WSTETH",
  fullyQualifiedName: CappedRatesConfigsUtils.Chainlink.fullyQualifiedName,
  params: {
    infoName: "STETH per 1 WSTETH",
    rateSource: RATE_SOURCE,
    rateMultiplier: 1e9, // multiplier to get returned rate from rateSource to 1e27 precision
    maxAPRPercent: 10 * 1e4, // 1e4 = 1%
    maxDownFromMaxReachedPercentDebt: 1 * 1e4, // 1e4 = 1%
    // invertCenterPrice depends on token0 vs token1 at dex, center price must always be token1/token0.
    // e.g. for a WSTETH / ETH dex, if WSTETH is token0 and ETH would be token1 then we want ETH per 1 WSTETH, so > 1, so not invert rate
    // but if WSTETH would be token1 and ETH token0, we need WSTETH per 1 ETH, so < 1, so invert rate.
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
