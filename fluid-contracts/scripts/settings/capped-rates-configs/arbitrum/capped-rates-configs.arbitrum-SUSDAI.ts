import { FluidCappedRateBase } from "../../../../typechain-types/contracts/oracle/cappedRates/erc4626CappedRate.sol/FluidERC4626CappedRate";
import { CappedRatesConfigsUtils } from "../cappedRatesConfigsUtil";

// ERC4626 exchange rate SUSDAI -> USDAI
// https://arbiscan.io/token/0x0b2b2b2076d95dda7817e785989fe353fe955ef9#readProxyContract
const RATE_SOURCE = "0x0b2b2b2076d95dda7817e785989fe353fe955ef9";

export const CAPPED_RATES_PARAMS_ARBITRUM_SUSDAI: {
  params: FluidCappedRateBase.CappedRateConstructorParamsStruct;
  tokenSymbol: string;
  fullyQualifiedName: string;
} = {
  tokenSymbol: "SUSDAI",
  fullyQualifiedName: CappedRatesConfigsUtils.ERC4626.fullyQualifiedName,
  params: {
    infoName: "USDAI per 1 SUSDAI",
    rateSource: RATE_SOURCE,
    rateMultiplier: CappedRatesConfigsUtils.ERC4626.rateMultiplier, // multiplier to get returned rate from rateSource to 1e27 precision
    maxAPRPercent: 500 * 1e4, // 1e4 = 1%
    maxDownFromMaxReachedPercentDebt: 100 * 1e4, // 1e4 = 1%
    // invertCenterPrice depends on token0 vs token1 at dex, center price must always be token1/token0.
    // e.g. for a RSETH / ETH dex, if RSETH is token0 and ETH would be token1 then we want ETH per 1 RSETH, so > 1, so not invert rate
    // but if RSETH would be token1 and ETH token0, we need RSETH per 1 ETH, so < 1, so invert rate.
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
