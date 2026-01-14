import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  FallbackCLRSOracleConfig,
  UniV3CheckCLRSOracleConfig,
  PegOracleConfig,
  DexSmartColPegOracleConfig,
  DexSmartDebtPegOracleConfig,
  DexSmartT4CLOracleConfig,
  DexSmartColPegOracleL2Config,
  DexSmartT4PegOracleConfig,
  DexSmartT4PegOracleL2Config,
  GenericOracleConfig,
  GenericUniV3CheckedOracleConfig,
  DexSmartDebtPegOracleL2Config,
  DexSmartT4CLOracleL2Config,
  GenericOracleL2Config,
  PegOracleL2Config,
} from "../../../settings/add-vault-configs/add-vault-interfaces";
import { FluidVersion } from "../../../settings";
import { deployOracleFallbackCLRSOracle } from "./deploy-oracle-fallbackCLRSOracle";
import { deployOracleUniV3CheckCLRSOracle } from "./deploy-oracle-uniV3CheckCLRSOracle";

import { FallbackCLRSOracleL2 } from "../../../../typechain-types/contracts/oracle/oraclesL2/fallbackCLRSOracleL2.sol/FallbackCLRSOracleL2";
import { deployOraclePegOracle } from "./deploy-oracle-pegOracle";
import { deployDexSmartColPegOracle } from "./deploy-oracle-dexSmartColPegOracle";
import { deployDexSmartDebtPegOracle } from "./deploy-oracle-dexSmartDebtPegOracle";
import { deployDexSmartT4CLOracle } from "./deploy-oracle-dexSmartT4CLOracle";
import { deployDexSmartT4PegOracle } from "./deploy-oracle-dexSmartT4PegOracle";
import { deployOracleGenericOracle } from "./deploy-oracle-genericOracle";
import { deployOracleGenericUniV3CheckedOracle } from "./deploy-oracle-genericUniV3CheckedOracle";

export const deployOracle = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  oracleConfig:
    | FallbackCLRSOracleConfig
    | UniV3CheckCLRSOracleConfig
    | PegOracleConfig
    | PegOracleL2Config
    | DexSmartColPegOracleConfig
    | DexSmartDebtPegOracleConfig
    | DexSmartT4CLOracleConfig
    | DexSmartT4PegOracleConfig
    | DexSmartColPegOracleL2Config
    | DexSmartT4PegOracleL2Config
    | DexSmartDebtPegOracleL2Config
    | DexSmartT4CLOracleL2Config
    | GenericOracleConfig
    | GenericOracleL2Config
    | GenericUniV3CheckedOracleConfig
) => {
  switch (oracleConfig.contractName) {
    case "UniV3CheckCLRSOracle":
    case "UniV3CheckCLRSOracleL2":
      oracleConfig = oracleConfig as UniV3CheckCLRSOracleConfig;
      // constructor args:
      // UniV3CheckCLRSConstructorParams memory params_
      await deployOracleUniV3CheckCLRSOracle(
        hre,
        version,
        oracleConfig.oracleName,
        oracleConfig.contractName == "UniV3CheckCLRSOracleL2", // is L2?
        [oracleConfig.infoName, oracleConfig.params]
      );
      break;
    case "FallbackCLRSOracle":
    case "FallbackCLRSOracleL2":
      oracleConfig = oracleConfig as FallbackCLRSOracleConfig;
      // constructor args:
      /// @notice                     sets the main source, Chainlink Oracle and Redstone Oracle data.
      /// @param mainSource_          which oracle to use as main source: 1 = Chainlink, 2 = Redstone (other one is fallback).
      /// @param chainlinkParams_     chainlink Oracle constructor params struct.
      /// @param redstoneOracle_      Redstone Oracle data. (address can be set to zero address if using Chainlink only)
      await deployOracleFallbackCLRSOracle(
        hre,
        version,
        oracleConfig.oracleName,
        oracleConfig.contractName == "FallbackCLRSOracleL2", // is L2?
        oracleConfig.contractName == "FallbackCLRSOracle"
          ? [oracleConfig.infoName, oracleConfig.mainSource, oracleConfig.chainlinkParams, oracleConfig.redstoneOracle]
          : [
              oracleConfig.infoName,
              {
                mainSource: oracleConfig.mainSource,
                chainlinkParams: oracleConfig.chainlinkParams,
                redstoneOracle: oracleConfig.redstoneOracle,
              } as FallbackCLRSOracleL2.CLRSConstructorParamsStruct,
            ]
      );
      break;
    case "PegOracle":
    case "PegOracleL2":
      oracleConfig = oracleConfig as PegOracleConfig;
      await deployOraclePegOracle(hre, version, oracleConfig.oracleName, oracleConfig.contractName != "PegOracle", [
        oracleConfig.infoName,
        oracleConfig.targetDecimals,
        oracleConfig.colTokenDecimals,
        oracleConfig.debtTokenDecimals,
        oracleConfig.erc4626Feed,
      ]);
      break;
    case "FluidGenericOracle":
      oracleConfig = oracleConfig as GenericOracleConfig;
      await deployOracleGenericOracle(hre, version, oracleConfig.oracleName, false, [
        oracleConfig.infoName,
        oracleConfig.targetDecimals,
        oracleConfig.sources,
      ]);
      break;
    case "FluidGenericOracleL2":
      oracleConfig = oracleConfig as GenericOracleL2Config;
      await deployOracleGenericOracle(hre, version, oracleConfig.oracleName, true, [
        oracleConfig.infoName,
        oracleConfig.targetDecimals,
        oracleConfig.sources,
      ]);
      break;
    case "FluidGenericUniV3CheckedOracle":
      oracleConfig = oracleConfig as GenericUniV3CheckedOracleConfig;
      await deployOracleGenericUniV3CheckedOracle(hre, version, oracleConfig.oracleName, [
        oracleConfig.infoName,
        oracleConfig.targetDecimals,
        oracleConfig.sources,
        oracleConfig.uniV3Params,
      ]);
      break;
    case "DexSmartColPegOracle":
      oracleConfig = oracleConfig as DexSmartColPegOracleConfig;
      await deployDexSmartColPegOracle(hre, version, oracleConfig.oracleName, false, [oracleConfig.params]);
      break;
    case "DexSmartColPegOracleL2":
      oracleConfig = oracleConfig as DexSmartColPegOracleL2Config;
      await deployDexSmartColPegOracle(hre, version, oracleConfig.oracleName, true, [oracleConfig.params]);
      break;
    case "DexSmartDebtPegOracle":
      oracleConfig = oracleConfig as DexSmartDebtPegOracleConfig;
      await deployDexSmartDebtPegOracle(hre, version, oracleConfig.oracleName, false, [oracleConfig.params]);
      break;
    case "DexSmartDebtPegOracleL2":
      oracleConfig = oracleConfig as DexSmartDebtPegOracleL2Config;
      await deployDexSmartDebtPegOracle(hre, version, oracleConfig.oracleName, true, [oracleConfig.params]);
      break;
    case "DexSmartT4CLOracle":
      oracleConfig = oracleConfig as DexSmartT4CLOracleConfig;
      await deployDexSmartT4CLOracle(hre, version, oracleConfig.oracleName, false, [oracleConfig.params]);
      break;

    case "DexSmartT4CLOracleL2":
      oracleConfig = oracleConfig as DexSmartT4CLOracleL2Config;
      await deployDexSmartT4CLOracle(hre, version, oracleConfig.oracleName, true, [oracleConfig.params]);
      break;

    case "DexSmartT4PegOracle":
      oracleConfig = oracleConfig as DexSmartT4PegOracleConfig;
      await deployDexSmartT4PegOracle(hre, version, oracleConfig.oracleName, false, [oracleConfig.params]);
      break;
    case "DexSmartT4PegOracleL2":
      oracleConfig = oracleConfig as DexSmartT4PegOracleL2Config;
      await deployDexSmartT4PegOracle(hre, version, oracleConfig.oracleName, true, [oracleConfig.params]);
      break;

    default:
      throw new Error("Oracle type deployment not implemented");
  }
};
