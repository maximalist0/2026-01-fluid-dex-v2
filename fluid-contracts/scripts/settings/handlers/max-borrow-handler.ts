import { TOKENS_MAINNET } from "../token-addresses";

export const maxBorrowHandlerConfig = {
  vault: "0x",
  borrowToken: "0x",
  maxUtilization: 0, // in 1e2 (1% = 100)
  minUpdateDiff: 0, // in 1e2 (1% = 100)
  protocolName: "Vault_", // e.g. Vault_SUSDE_USDC;
};
