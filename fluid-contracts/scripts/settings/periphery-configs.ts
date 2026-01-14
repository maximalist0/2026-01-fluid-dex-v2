import {
  FLA_CONTRACT_ADDRESS,
  FLA_CONTRACT_ADDRESS_ARBITRUM,
  FLA_CONTRACT_ADDRESS_MAINNET,
} from "./contract-addresses";
import { PROD_AVOCADO_MULTISIG_GOVERNANCE } from "./core-configs/core-configs";
import { networkTokens, TOKENS_ARBITRUM, TOKENS_MAINNET, wNativeToken } from "./token-addresses";

const PERIPHERY_CONTRACTS_OWNER = "0x9800020b610194dBa52CF606E8Aa142F9F256166";

const REBALANCER_ADDRESSES = [
  "0x3BE5C671b20649DCA5D916b5698328D54BdAAf88", // Avo address
  "0xb287f8A01a9538656c72Fa6aE1EE0117A187Be0C", // EOA
  "0xAb957B471b22d307AC5fbB3FCcD4191433B2AA62",
];

const OLD_FACTORY = "0x3B38099b79a143038a3935C619B2A3eA70438C60";
const NEW_FACTORY = "0x324c5Dc1fC42c7a4D43d92df1eBA58a54d13Bf2d";

// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const peripheryContractsConfig = (network: string) => ({
  wallet: {
    factoryOwner: PROD_AVOCADO_MULTISIG_GOVERNANCE,
  },
  liquidation: {
    owner: PERIPHERY_CONTRACTS_OWNER,
    fla: FLA_CONTRACT_ADDRESS(network),
    weth: wNativeToken(network).address,
    rebalancers: REBALANCER_ADDRESSES,
  },
  migration: {
    owner: PERIPHERY_CONTRACTS_OWNER,
    fla: FLA_CONTRACT_ADDRESS(network),
    weth: wNativeToken(network).address,
    oldFactory: OLD_FACTORY,
    newFactory: NEW_FACTORY,
  },
});
