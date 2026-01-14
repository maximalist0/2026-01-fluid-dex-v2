export const defaultProdDeploymentSalt = "0x0003";
export const defaultStagingDeploymentSalt = "0x000634000100";

export type FluidVersion = "v1_0_0" | "v1_1_0";

export const deploymentsConfig = {
  // salt for deterministic Create2 deployment, can be changed to create new deployment for same contract
  // must be a hex number (defaults are 0x0003 for production, 0x000634000100 for staging).
  deterministicDeploymentSalt: defaultProdDeploymentSalt,
  // number of block confirmations to wait for depending on network. Might be required to be adjusted for some networks
  // for the automatic verification on the block explorer to work properly (fallback is used if block explorer reports
  // that code is not available yet)
  waitConfirmations: (network: string) => {
    // do not wait for confirmations locally
    switch (network) {
      case "hardhat":
      case "localhost":
        return 0;
      case "polygon":
      case "plasma":
        return 12;
      default:
        return 5;
    }
  },

  // can set deployment `maxFeePerGas` value which limits total gwei used for a deployment (base fee + priority fee).
  // by default, the script will run until gas price falls low enough to queue the tx with the given max gas price
  // (trying to queue, wait 8 seconds, try again, max default tries 10000).
  // e.g. set 50_100_000_000 will limit to 50.1 gwei. set to 0 to allow any gas cost.
  maxFeePerGas: 0,

  // ----------------------------------------------
  // @dev below values are very likely static

  // address of the Instadapp CREATE3 factory
  instadappCreate3FactoryAddress: "0x5FfeB6F31C0e6A67ed09a21647187EA3c145bF96",
};
