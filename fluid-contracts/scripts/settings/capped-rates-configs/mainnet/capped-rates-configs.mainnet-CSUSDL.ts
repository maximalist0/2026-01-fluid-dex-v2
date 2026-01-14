import { FluidCappedRateBase } from "../../../../typechain-types/contracts/oracle/cappedRates/erc4626CappedRate.sol/FluidERC4626CappedRate";
import { CappedRatesConfigsUtils } from "../cappedRatesConfigsUtil";

// https://etherscan.io/address/0xbEeFc011e94f43b8B7b455eBaB290C7Ab4E216f1 CSUSDL
const RATE_SOURCE = "0xbEeFc011e94f43b8B7b455eBaB290C7Ab4E216f1";
// https://etherscan.io/address/0x7751E2F4b8ae93EF6B79d86419d42FE3295A4559 WUSDL
const RATE_SOURCE2 = "0x7751E2F4b8ae93EF6B79d86419d42FE3295A4559";

export const CAPPED_RATES_PARAMS_MAINNET_CSUSDL: {
  params: FluidCappedRateBase.CappedRateConstructorParamsStruct;
  tokenSymbol: string;
  fullyQualifiedName: string;
  rateSource2?: string;
} = {
  tokenSymbol: "CSUSDL",
  fullyQualifiedName: CappedRatesConfigsUtils.ERC46262x.fullyQualifiedName,
  params: {
    infoName: "USDL per 1 CSUSDL",
    rateSource: RATE_SOURCE,
    rateMultiplier: CappedRatesConfigsUtils.ERC46262x.rateMultiplier, // multiplier to get returned rate from rateSource to 1e27 precision
    maxAPRPercent: 500 * 1e4, // 1e4 = 1%
    maxDownFromMaxReachedPercentDebt: 100 * 1e4, // 1e4 = 1%
    // invertCenterPrice depends on token0 vs token1 at dex, center price must always be token1/token0.
    // e.g. for a WSTETH / ETH dex, if WSTETH is token0 and ETH would be token1 then we want ETH per 1 WSTETH, so > 1, so not invert rate
    // but if WSTETH would be token1 and ETH token0, we need WSTETH per 1 ETH, so < 1, so invert rate.
    invertCenterPrice: true,

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
  rateSource2: RATE_SOURCE2,
};
