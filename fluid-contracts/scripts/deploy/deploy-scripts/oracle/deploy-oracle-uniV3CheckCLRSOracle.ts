import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { L2_SEQUENCER_UPTIME_FEED } from "../../../settings/contract-addresses";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployOracleUniV3CheckCLRSOracle = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  name: string,
  isL2: boolean,
  constructorArgs: any
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    name,
    isL2,
    constructorArgs
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, boolean, any]
) => {
  const name: string = args[0];
  const isL2: boolean = args[1];
  let constructorArgs = args[2];

  let contractPath = "contracts/oracle/oracles/uniV3CheckCLRSOracle.sol:UniV3CheckCLRSOracle";
  if (isL2) {
    constructorArgs = [...constructorArgs, L2_SEQUENCER_UPTIME_FEED(hre.network.name)];
    contractPath = "contracts/oracle/oraclesL2/uniV3CheckCLRSOracleL2.sol:UniV3CheckCLRSOracleL2";
  }

  const deployedAddress = await deploy(
    hre,
    name,
    contractPath,
    version,
    // constructor args: UniV3CheckCLRSConstructorParams memory params
    //
    //   struct UniV3CheckCLRSConstructorParams {
    //     /// @param uniV3Params                UniV3Oracle constructor params struct.
    //     UniV3ConstructorParams uniV3Params;
    //     /// @param chainlinkParams            ChainlinkOracle constructor params struct for UniV3CheckCLRSOracle.
    //     ChainlinkConstructorParams chainlinkParams;
    //     /// @param redstoneOracle             Redstone Oracle data for UniV3CheckCLRSOracle. (address can be set to zero address if using Chainlink only)
    //     RedstoneOracleData redstoneOracle;
    //     /// @param rateSource                 which oracle to use as final rate source for UniV3CheckCLRSOracle:
    //     ///                                         - 1 = UniV3 ONLY (no check),
    //     ///                                         - 2 = UniV3 with Chainlink / Redstone check
    //     ///                                         - 3 = Chainlink / Redstone with UniV3 used as check.
    //     uint8 rateSource;
    //     /// @param fallbackMainSource         which oracle to use as CL/RS main source for UniV3CheckCLRSOracle: see FallbackOracleImpl constructor `mainSource_`
    //     uint8 fallbackMainSource;
    //     /// @param rateCheckMaxDeltaPercent   Rate check oracle delta in 1e2 percent for UniV3CheckCLRSOracle
    //     uint256 rateCheckMaxDeltaPercent;
    // }
    constructorArgs
  );
  return deployedAddress;
};
