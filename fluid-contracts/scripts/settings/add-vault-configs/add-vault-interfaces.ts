import {
  RedstoneStructs,
  ChainlinkStructs,
} from "../../../typechain-types/contracts/oracle/oracles/fallbackCLRSOracle.sol/FallbackCLRSOracle";
import { GenericOracleStructs } from "../../../typechain-types/contracts/oracle/oracles/genericOracleBase.sol/FluidGenericOracleBase";
import { DexSmartT4CLOracle } from "../../../typechain-types/contracts/oracle/oracles/dex/dexSmartT4CLOracle.sol/DexSmartT4CLOracle";
import { DexSmartT4PegOracle } from "../../../typechain-types/contracts/oracle/oracles/dex/dexSmartT4PegOracle.sol/DexSmartT4PegOracle";
import { DexSmartColPegOracle } from "../../../typechain-types/contracts/oracle/oracles/dex/dexSmartColPegOracle.sol/DexSmartColPegOracle";
import { DexSmartDebtPegOracle } from "../../../typechain-types/contracts/oracle/oracles/dex/dexSmartDebtPegOracle.sol/DexSmartDebtPegOracle";
import { UniV3CheckCLRSOracle } from "../../../typechain-types/contracts/oracle/oracles/uniV3CheckCLRSOracle.sol/UniV3CheckCLRSOracle";

interface OracleConfigBase {
  oracleName: string; // should be contractName_fromTokenSymbol_toTokenSymbol. E.g. "UniV3CheckCLRSOracle_MATIC_USDC"
  infoName: string; // short helper identifier stored as immutable on-chain
  targetDecimals: number;
  contractName:
    | "FallbackCLRSOracle"
    | "FallbackCLRSOracleL2"
    | "UniV3CheckCLRSOracle"
    | "UniV3CheckCLRSOracleL2"
    | "CLRS2UniV3CheckCLRSOracleL2"
    | "PegOracle"
    | "PegOracleL2"
    | "FluidGenericOracle"
    | "FluidGenericOracleL2"
    | "FluidGenericUniV3CheckedOracle";
}

interface DexOracleConfigBase {
  oracleName: string; // should be contractName_fromTokenSymbol_toTokenSymbol. E.g. "UniV3CheckCLRSOracle_MATIC_USDC"
  // info name and target decimals is in params for dex oracles
  contractName:
    | "DexSmartColPegOracle"
    | "DexSmartDebtPegOracle"
    | "DexSmartT4CLOracle"
    | "DexSmartT4PegOracle"
    | "DexSmartT4CLOracleL2"
    | "DexSmartT4PegOracleL2"
    | "DexSmartColPegOracleL2"
    | "DexSmartDebtPegOracleL2";
}

interface CenterPriceConfigBase {
  centerPriceName: string; // should be contractName_fromTokenSymbol_toTokenSymbol. E.g. "WstETHInvertCenterPrice_MATIC_USDC"
  infoName: string; // short helper identifier stored as immutable on-chain
  contractName: "ChainlinkCenterPriceL2" | "FluidGenericCenterPrice" | "FluidGenericCenterPriceL2";
}

export interface FallbackCLRSOracleConfig extends OracleConfigBase {
  mainSource: number; // which oracle to use as main source: 1 = Chainlink, 2 = Redstone (other one is fallback).
  contractName: "FallbackCLRSOracle" | "FallbackCLRSOracleL2";
  chainlinkParams: ChainlinkStructs.ChainlinkConstructorParamsStruct;
  redstoneOracle: RedstoneStructs.RedstoneOracleDataStruct;
}

export interface UniV3CheckCLRSOracleConfig extends OracleConfigBase {
  contractName: "UniV3CheckCLRSOracle" | "UniV3CheckCLRSOracleL2";
  params: UniV3CheckCLRSOracle.UniV3CheckCLRSConstructorParamsStruct;
}

export interface PegOracleConfig extends OracleConfigBase {
  contractName: "PegOracle";
  colTokenDecimals: number;
  debtTokenDecimals: number;
  erc4626Feed: string;
}

export interface PegOracleL2Config extends OracleConfigBase {
  contractName: "PegOracleL2";
  colTokenDecimals: number;
  debtTokenDecimals: number;
  erc4626Feed: string;
}

export interface DexSmartT4CLOracleConfig extends DexOracleConfigBase {
  contractName: "DexSmartT4CLOracle";
  params: DexSmartT4CLOracle.DexSmartT4CLOracleParamsStruct;
}
export interface DexSmartT4CLOracleL2Config extends DexOracleConfigBase {
  contractName: "DexSmartT4CLOracleL2";
  params: DexSmartT4CLOracle.DexSmartT4CLOracleParamsStruct;
}

export interface DexSmartT4PegOracleConfig extends DexOracleConfigBase {
  contractName: "DexSmartT4PegOracle";
  params: DexSmartT4PegOracle.DexSmartT4PegOracleParamsStruct;
}

export interface DexSmartT4PegOracleL2Config extends DexOracleConfigBase {
  contractName: "DexSmartT4PegOracleL2";
  params: DexSmartT4PegOracle.DexSmartT4PegOracleParamsStruct;
}

export interface DexSmartColPegOracleConfig extends DexOracleConfigBase {
  contractName: "DexSmartColPegOracle";
  params: DexSmartColPegOracle.DexSmartColPegOracleParamsStruct;
}

export interface DexSmartColPegOracleL2Config extends DexOracleConfigBase {
  contractName: "DexSmartColPegOracleL2";
  params: DexSmartColPegOracle.DexSmartColPegOracleParamsStruct;
}

export interface DexSmartDebtPegOracleConfig extends DexOracleConfigBase {
  contractName: "DexSmartDebtPegOracle";
  params: DexSmartDebtPegOracle.DexSmartDebtPegOracleParamsStruct;
}

export interface DexSmartDebtPegOracleL2Config extends DexOracleConfigBase {
  contractName: "DexSmartDebtPegOracleL2";
  params: DexSmartDebtPegOracle.DexSmartDebtPegOracleParamsStruct;
}

export interface ChainlinkCenterPriceL2Config extends CenterPriceConfigBase {
  contractName: "ChainlinkCenterPriceL2";
  clParams: ChainlinkStructs.ChainlinkConstructorParamsStruct;
}

export enum GenericOracleSourceType {
  Fluid = 0, // 0, e.g. ContractRate or some other IFluidOracle
  Redstone = 1, // 1
  Chainlink = 2, // 2
  UniV3Checked = 3, // 3
  FluidDebt = 4, // 4
}
export interface GenericOracleConfig extends OracleConfigBase {
  contractName: "FluidGenericOracle";
  sources: GenericOracleStructs.OracleHopSourceStruct[];
  targetDecimals: number;
}
export interface GenericOracleL2Config extends OracleConfigBase {
  contractName: "FluidGenericOracleL2";
  sources: GenericOracleStructs.OracleHopSourceStruct[];
  targetDecimals: number;
}
export interface GenericUniV3CheckedOracleConfig extends OracleConfigBase {
  contractName: "FluidGenericUniV3CheckedOracle";
  sources: GenericOracleStructs.OracleHopSourceStruct[];
  uniV3Params: UniV3CheckCLRSOracle.UniV3CheckCLRSConstructorParamsStruct;
  targetDecimals: number;
}
export interface GenericCenterPriceConfig extends CenterPriceConfigBase {
  contractName: "FluidGenericCenterPrice";
  sources: GenericOracleStructs.OracleHopSourceStruct[];
}
export interface GenericCenterPriceL2Config extends CenterPriceConfigBase {
  contractName: "FluidGenericCenterPriceL2";
  sources: GenericOracleStructs.OracleHopSourceStruct[];
}

export interface VaultCoreSettings {
  supplyRateMagnifier: number;
  borrowRateMagnifier: number;
  collateralFactor: number;
  liquidationThreshold: number;
  liquidationMaxLimit: number;
  withdrawGap: number;
  liquidationPenalty: number;
  borrowFee: number;
}

export interface VaultT2CoreSettings {
  supplyRate: number;
  borrowRateMagnifier: number;
  collateralFactor: number;
  liquidationThreshold: number;
  liquidationMaxLimit: number;
  withdrawGap: number;
  liquidationPenalty: number;
  borrowFee: number;
}

export interface VaultT4CoreSettings {
  supplyRate: number;
  borrowRate: number;
  collateralFactor: number;
  liquidationThreshold: number;
  liquidationMaxLimit: number;
  withdrawGap: number;
  liquidationPenalty: number;
  borrowFee: number;
}
