import { logError } from "../util";

export const buildExplorerLink = (network: string, deployedAddress: string) => {
  switch (network) {
    case "mainnet":
      return `[Link](https://etherscan.io/address/${deployedAddress}#code)`;
    case "polygon":
      return `[Link](https://polygonscan.com/address/${deployedAddress}#code)`;
    case "arbitrum":
      return `[Link](https://arbiscan.io/address/${deployedAddress}#code)`;
    case "optimism":
      return `[Link](https://optimistic.etherscan.io/address/${deployedAddress}#code)`;
    case "avalanche":
      return `[Link](https://snowtrace.io/address/${deployedAddress}#code)`;
    case "binance":
      return `[Link](https://bscscan.com/address/${deployedAddress}#code)`;
    case "gnosis":
      return `[Link](https://gnosisscan.io/address/${deployedAddress}#code)`;
    case "zkevm":
      return `[Link](https://zkevm.polygonscan.com/address/${deployedAddress}#code)`;
    case "fantom":
      return `[Link](https://ftmscan.com/address/${deployedAddress}#code)`;
    case "aurora":
      return `[Link](https://explorer.aurora.dev/address/${deployedAddress}#code)`;
    case "goerli":
      return `[Link](https://goerli.etherscan.io/address/${deployedAddress}#code)`;
    case "base":
      return `[Link](https://basescan.org/address/${deployedAddress}#code)`;
    case "fuse":
      return `[Link](https://explorer.fuse.io/address/${deployedAddress}#code)`;
    case "sonic":
      return `[Link](https://sonicscan.org/address/${deployedAddress}#code)`;
    case "plasma":
      return `[Link](https://plasmascan.to/address/${deployedAddress}#code)`;
    // for local just create some link for testing
    case "localhost":
    case "hardhat":
      return `[Link](https://localhost.example.io/address/${deployedAddress}#code)`;
    default:
      logError(`BUILDING LOGS EXPLORER LINK for ${network} failed! FIX MANUALLY. Add network to "explorers.config.ts"`);
      return `[FIX THIS LINK](https://FIX.THIS.LINK/address/${deployedAddress}#code)`;
  }
};
