import { TOKENS_MAINNET } from "../token-addresses";

// export const ethenaRateHandlerConfig = {
//   vault: "0x",
//   borrowToken: "0x",
//   ratePercentMargin: 0, // in 1e2 (1% = 100)
//   maxRewardsDelay: 0, // in seconds
//   utilizationPenaltyStart: 0, // in 1e2 for utilization (1% = 100)
//   utilization100PenaltyPercent: 0, // in 1e2 for utilization (1% = 100)
//   protocolName: "Vault_", // e.g. Vault_SUSDE_USDC;
// };

// // Vault_sUSDe_USDC v.1.1.0 & Vault_USDe_USDC v.1.1.0
// export const ethenaRateHandlerConfig = {
//   vault: "0x3996464c0fCCa8183e13ea5E5e74375e2c8744Dd", // Vault_sUSDe_USDC v.1.1.0
//   vault2: "0xB98EeA7132f1De6EC24D4Ee4AfBDf4d63Ef1a9F0", // Vault_USDe_USDC v.1.1.0
//   borrowToken: TOKENS_MAINNET.USDC.address,
//   ratePercentMargin: 1500, // in 1e2 (1% = 100)
//   maxRewardsDelay: 900, // in seconds
//   utilizationPenaltyStart: 9000, // in 1e2 for utilization (1% = 100)
//   utilization100PenaltyPercent: 1000, // in 1e2 for utilization (1% = 100)
//   protocolName: "Vault_SUSDE-AND-USDE_USDC", // e.g. Vault_SUSDE_USDC;
// };

// // Vault_sUSDe_USDT v.1.1.0 Vault_USDe_USDT v.1.1.0
// export const ethenaRateHandlerConfig = {
//   vault: "0xBc345229C1b52e4c30530C614BB487323BA38Da5", // Vault_sUSDe_USDT v.1.1.0
//   vault2: "0x8FB5c0896C70B0056A09249EcEF7E7Ee01f037AF", // Vault_USDe_USDT v.1.1.0
//   borrowToken: TOKENS_MAINNET.USDT.address,
//   ratePercentMargin: 1500, // in 1e2 (1% = 100)
//   maxRewardsDelay: 900, // in seconds
//   utilizationPenaltyStart: 9000, // in 1e2 for utilization (1% = 100)
//   utilization100PenaltyPercent: 1000, // in 1e2 for utilization (1% = 100)
//   protocolName: "Vault_SUSDE-AND-USDE_USDT", // e.g. Vault_SUSDE_USDC;
// };

// VaultT1_sUSDe_GHO v.1.1.0 Vault_USDe_GHO v.1.1.0
export const ethenaRateHandlerConfig = {
  vault: "0x2F3780e21cAba1bEdFB24E37C97917def304dFFA", // VaultT1_sUSDe_GHO v.1.1.0
  vault2: "0x75580D4be33C61700969583fDAeC566Ca84e5B69", // VaultT1_USDe_GHO v.1.1.0
  borrowToken: TOKENS_MAINNET.GHO.address,
  ratePercentMargin: 1500, // in 1e2 (1% = 100)
  maxRewardsDelay: 900, // in seconds
  utilizationPenaltyStart: 9000, // in 1e2 for utilization (1% = 100)
  utilization100PenaltyPercent: 1000, // in 1e2 for utilization (1% = 100)
  protocolName: "Vault_SUSDE-AND-USDE_GHO", // e.g. Vault_SUSDE_USDC;
};
