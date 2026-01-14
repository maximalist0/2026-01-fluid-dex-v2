import { NATIVE_TOKEN, TOKENS_MAINNET, TOKENS_ARBITRUM, TOKENS_BASE } from "../token-addresses";

export const bufferRateHandlerConfig = {
  /// @notice supply token at Liquidity which borrow rate is based on
  supplyToken: "", // TODO.WSTETH.address
  /// @notice borrow token at Liquidity for which the borrow rate is managed
  borrowToken: NATIVE_TOKEN.address,
  /// @notice buffer at kink1 for the rate. borrow rate = supply rate + buffer. In percent (100 = 1%, 1 = 0.01%)
  // Note this is a int so can be negative
  rateBufferKink1: 150,
  /// @notice buffer at kink2 for the rate. borrow rate = supply rate + buffer. In percent (100 = 1%, 1 = 0.01%)
  /// @dev only used if CURRENT borrow rate mode at Liquidity is V2 (with 2 kinks).
  // Note this is a int so can be negative
  rateBufferKink2: 200,
  /// @dev minimum percent difference to trigger an update. In percent (100 = 1%, 1 = 0.01%)
  minUpdateDiff: 25,
  tokenPairSymbols: "WSTETH_ETH", // e.g. WSTETH_ETH; -> would refer to wstETH as supply token (used as base rate) and ETH as borrow token
};
