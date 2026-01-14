export const CappedRatesConfigsUtils = {
  ERC4626: {
    fullyQualifiedName: "contracts/oracle/cappedRates/erc4626CappedRate.sol:FluidERC4626CappedRate",
    rateMultiplier: 1,
  },
  ERC46262x: {
    fullyQualifiedName: "contracts/oracle/cappedRates/erc46262xCappedRate.sol:FluidERC46262xCappedRate",
    rateMultiplier: 1,
  },
  Chainlink: {
    fullyQualifiedName: "contracts/oracle/cappedRates/chainlinkCappedRate.sol:FluidChainlinkCappedRate",
  },
  Balancer: {
    fullyQualifiedName: "contracts/oracle/cappedRates/balancerCappedRate.sol:FluidBalancerCappedRate",
  },
  ChainlinkL2: {
    fullyQualifiedName: "contracts/oracle/cappedRatesL2/chainlinkCappedRateL2.sol:FluidChainlinkCappedRateL2",
  },
  ERC4626L2: {
    fullyQualifiedName: "contracts/oracle/cappedRatesL2/erc4626CappedRateL2.sol:FluidERC4626CappedRateL2",
    rateMultiplier: 1,
  },
};
