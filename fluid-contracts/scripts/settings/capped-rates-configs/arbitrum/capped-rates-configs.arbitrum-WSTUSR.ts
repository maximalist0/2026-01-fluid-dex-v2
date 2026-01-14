import { FluidCappedRateBase } from "../../../../typechain-types/contracts/oracle/cappedRates/erc4626CappedRate.sol/FluidERC4626CappedRate";
import { CappedRatesConfigsUtils } from "../cappedRatesConfigsUtil";

// https://arbiscan.io/address/0x9BC7E5a6f1EED1C3217d2c63ad680DF83D84a906
// https://data.chain.link/feeds/arbitrum/mainnet/wstusr-stusr-exchange-rate
// The convertToAssets function in the wstUSR contract converts wstUSR to stUSR
// When unstaking, you get back USR at this 1:1 ratio atomically
// see docs https://docs.resolv.xyz/litepaper/using-resolv/usr/stake
const RATE_SOURCE = "0x9BC7E5a6f1EED1C3217d2c63ad680DF83D84a906";

export const CAPPED_RATES_PARAMS_ARBITRUM_WSTUSR: {
  params: FluidCappedRateBase.CappedRateConstructorParamsStruct;
  tokenSymbol: string;
  fullyQualifiedName: string;
} = {
  tokenSymbol: "WSTUSR",
  fullyQualifiedName: CappedRatesConfigsUtils.ChainlinkL2.fullyQualifiedName,
  params: {
    infoName: "USR per 1 WSTUSR",
    rateSource: RATE_SOURCE,
    rateMultiplier: 1e9, // multiplier to get returned rate from rateSource to 1e27 precision
    maxAPRPercent: 90 * 1e4, // 1e4 = 1%
    maxDownFromMaxReachedPercentDebt: 5 * 1e4, // 1e4 = 1%
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
