export const RESERVE_CONTRACT = "0x0000000000000000000000000000000000000000"; // leave as this to automatically read address from deployment logs

export const LIDO_WITHDRAWAL_QUEUE = "0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1";

export const FLA_CONTRACT_ADDRESS_MAINNET = "0x352423e2fA5D5c99343d371C9e3bC56C87723Cc7";

export const FLA_CONTRACT_ADDRESS_ARBITRUM = "0x352423e2fA5D5c99343d371C9e3bC56C87723Cc7";

export const PENDLE_PYLPORACLE = "0x9a9Fa8338dd5E5B2188006f1Cd2Ef26d921650C2";

export const WEETHS_ACCOUNTANT = "0xbe16605B22a7faCEf247363312121670DFe5afBE";

export const RSETH_LRT_ORACLE = "0x349A73444b1a310BAe67ef67973022020d70020d";

export const LBTC_FUNDAMENTAL_REDSTONE_ORACLE = "0xb415eAA355D8440ac7eCB602D3fb67ccC1f0bc81";

export const EBTC_ACCOUNTANT = "0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F";

export const EZETH_BALANCER_RATE_PROVIDER = "0x387dBc0fB00b26fb085aa658527D5BE98302c84C";

export const L2_SEQUENCER_UPTIME_FEED = (network: string) => {
  // see https://docs.chain.link/data-feeds/l2-sequencer-feeds#available-networks
  switch (network) {
    case "hardhat":
    case "localhost":
    case "arbitrum":
      return "0xFdB631F5EE196F0ed6FAa767959853A9F217697D";
    case "base":
      return "0xBCF85224fc0756B9Fa45aA7892530B47e10b6433";
    default:
      throw new Error("L2 sequencer uptime feed not defined");
  }
};

export const FLA_CONTRACT_ADDRESS = (network: string) => {
  switch (network) {
    case "hardhat":
    case "localhost":
    case "arbitrum":
    case "mainnet":
    case "base":
    case "polygon":
    case "plasma":
      return "0x352423e2fA5D5c99343d371C9e3bC56C87723Cc7";
    default:
      throw new Error("FLA address not defined");
  }
};

export const AVOCADO_TEAM_MULTISIG = "0x4F6F977aCDD1177DCD81aB83074855EcB9C2D49e";
