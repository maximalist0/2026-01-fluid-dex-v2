import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  ChainlinkStructs,
  RedstoneStructs,
} from "../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { deployOracle } from "../deploy/deploy-scripts";
import { FluidVersion, TOKENS_MAINNET } from "../settings";
import { FallbackCLRSOracleConfig, WstETHCLRSOracleConfig } from "../settings/add-vault-configs/add-vault-interfaces";
import { logDebug } from "../util";

const ORACLE_CONFIG: WstETHCLRSOracleConfig = {
  oracleName: "WstETHCLRSOracle_WSTETH_USD",
  contractName: "WstETHCLRSOracle",
  infoName: "USD for 1 WSTETH",
  /// @param mainSource_          which oracle to use as main source:
  ///                                  - 1 = Chainlink ONLY (no fallback)
  ///                                  - 2 = Chainlink with Redstone Fallback
  ///                                  - 3 = Redstone with Chainlink Fallback
  mainSource: 1,
  wstETH: "0x2F95631D59F564D5e2dD0c028d4DAF3B876D84Fd", // Wsteth contract rate
  chainlinkParams: {
    hops: 1,
    feed1: {
      feed: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8", // STETH <> USD
      invertRate: false,
      token0Decimals: 18,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed2: {
      feed: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
    feed3: {
      feed: ethers.constants.AddressZero,
      invertRate: false,
      token0Decimals: 0,
    } as ChainlinkStructs.ChainlinkFeedDataStruct,
  } as ChainlinkStructs.ChainlinkConstructorParamsStruct,
  redstoneOracle: {
    // Redstone Oracle data. (address can be set to zero address if using Chainlink only)
    oracle: ethers.constants.AddressZero,
    invertRate: false,
    token0Decimals: 0,
  } as RedstoneStructs.RedstoneOracleDataStruct,
};

export const prodDeployOracle = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID DEPLOY ORACLE -------------------\n");

  const version: FluidVersion = "v1_1_0";

  await deployOracle(hre, version, ORACLE_CONFIG);

  logDebug("\n-----------------------------------------\n\n");
};
