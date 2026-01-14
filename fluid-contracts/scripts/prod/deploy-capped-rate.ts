import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FluidVersion } from "../settings";
import { logDebug, logSuccess } from "../util";
import {
  deployCappedRate,
  deployFluidCappedRateInvertCenterPrice,
  getFluidCappedRateName,
} from "../deploy/deploy-scripts";
import { CAPPED_RATES_PARAMS_POLYGON_MATICX } from "../settings/capped-rates-configs/polygon/capped-rates-configs.polygon-MATICX";
import { CAPPED_RATES_PARAMS_MAINNET_RLP } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-RLP";
import { CAPPED_RATES_PARAMS_MAINNET_WSTUSR } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-WSTUSR";
import { CAPPED_RATES_PARAMS_POLYGON_WUSDM } from "../settings/capped-rates-configs/polygon/capped-rates-configs.polygon-WUSDM";
import { CAPPED_RATES_PARAMS_POLYGON_TRUMATIC } from "../settings/capped-rates-configs/polygon/capped-rates-configs.polygon-TRUMATIC";
import { CAPPED_RATES_PARAMS_BASE_WSTETH } from "../settings/capped-rates-configs/base/capped-rates-configs.base-WSTETH";
import { CAPPED_RATES_PARAMS_BASE_WEETH } from "../settings/capped-rates-configs/base/capped-rates-configs.base-WEETH";
import { CAPPED_RATES_PARAMS_MAINNET_SUSDE } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-SUSDE";
import { CAPPED_RATES_PARAMS_MAINNET_CSUSDL } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-CSUSDL";
import { CAPPED_RATES_PARAMS_BASE_YOETH } from "../settings/capped-rates-configs/base/capped-rates-configs.base-YOETH";
import { CAPPED_RATES_PARAMS_BASE_YOUSD } from "../settings/capped-rates-configs/base/capped-rates-configs.base-YOUSD";
import { CAPPED_RATES_PARAMS_BASE_YOBTC } from "../settings/capped-rates-configs/base/capped-rates-configs.base-YOBTC";
import { CAPPED_RATES_PARAMS_BASE_RSETH } from "../settings/capped-rates-configs/base/capped-rates-configs.base-RSETH";
import { CAPPED_RATES_PARAMS_ARBITRUM_RSETH } from "../settings/capped-rates-configs/arbitrum/capped-rates-configs.arbitrum-RSETH";
import { CAPPED_RATES_PARAMS_ARBITRUM_SUSDAI } from "../settings/capped-rates-configs/arbitrum/capped-rates-configs.arbitrum-SUSDAI";
import { CAPPED_RATES_PARAMS_MAINNET_LBTC } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-LBTC";
import { CAPPED_RATES_PARAMS_BASE_WSTUSR } from "../settings/capped-rates-configs/base/capped-rates-configs.base-WSTUSR";
import { CAPPED_RATES_PARAMS_ARBITRUM_WSTUSR } from "../settings/capped-rates-configs/arbitrum/capped-rates-configs.arbitrum-WSTUSR";
import { CAPPED_RATES_PARAMS_ARBITRUM_SYRUPUSDC } from "../settings/capped-rates-configs/arbitrum/capped-rates-configs.arbitrum-SYRUPUSDC";
import { CAPPED_RATES_PARAMS_ARBITRUM_SUSDE } from "../settings/capped-rates-configs/arbitrum/capped-rates-configs.arbitrum-SUSDE";
import { CAPPED_RATES_PARAMS_BASE_SYRUPUSDC } from "../settings/capped-rates-configs/base/capped-rates-configs.base-SYRUPUSDC";
import { CAPPED_RATES_PARAMS_MAINNET_SYRUPUSDC } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-SYRUPUSDC";
import { CAPPED_RATES_PARAMS_ARBITRUM_EZETH } from "../settings/capped-rates-configs/arbitrum/capped-rates-configs.arbitrum-EZETH";
import { CAPPED_RATES_PARAMS_PLASMA_WSTUSR } from "../settings/capped-rates-configs/plasma/capped-rates-configs.plasma-WSTUSR";
import { CAPPED_RATES_PARAMS_PLASMA_SUSDE } from "../settings/capped-rates-configs/plasma/capped-rates-configs.plasma-SUSDE";
import { CAPPED_RATES_PARAMS_PLASMA_SYRUPUSDT } from "../settings/capped-rates-configs/plasma/capped-rates-configs.plasma-SYRUPUSDT";
import { CAPPED_RATES_PARAMS_PLASMA_WEETH } from "../settings/capped-rates-configs/plasma/capped-rates-configs.plasma-WEETH";
import { CAPPED_RATES_PARAMS_ARBITRUM_RLP } from "../settings/capped-rates-configs/arbitrum/capped-rates-configs.arbitrum-RLP";
import { CAPPED_RATES_PARAMS_BASE_SUSDE } from "../settings/capped-rates-configs/base/capped-rates-configs.base-SUSDE";
import { CAPPED_RATES_PARAMS_PLASMA_SUSDAI } from "../settings/capped-rates-configs/plasma/capped-rates-configs.plasma-SUSDAI";
import { CAPPED_RATES_PARAMS_BASE_EZETH } from "../settings/capped-rates-configs/base/capped-rates-configs.base-EZETH";
import { CAPPED_RATES_PARAMS_PLASMA_WRSETH } from "../settings/capped-rates-configs/plasma/capped-rates-configs.plasma-WRSETH";
import { CAPPED_RATES_PARAMS_MAINNET_SYRUPUSDT } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-SYRUPUSDT";
import { CAPPED_RATES_PARAMS_MAINNET_JRUSDE } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-JRUSDE";
import { CAPPED_RATES_PARAMS_MAINNET_SRUSDE } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-SRUSDE";
import { CAPPED_RATES_PARAMS_MAINNET_OSETH } from "../settings/capped-rates-configs/mainnet/capped-rates-configs.mainnet-OSETH";

export const prodDeployCappedRate = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- DEPLOY FLUID CAPPED RATE -------------------\n");
  const version: FluidVersion = "v1_0_0";

  // const params = CAPPED_RATES_PARAMS_POLYGON_WUSDM;
  // const params = CAPPED_RATES_PARAMS_POLYGON_MATICX;
  // const params = CAPPED_RATES_PARAMS_MAINNET_RLP;
  // const params = CAPPED_RATES_PARAMS_MAINNET_WSTUSR;
  // const params = CAPPED_RATES_PARAMS_POLYGON_TRUMATIC;
  // const params = CAPPED_RATES_PARAMS_BASE_WSTETH;
  // const params = CAPPED_RATES_PARAMS_BASE_WEETH;
  // const params = CAPPED_RATES_PARAMS_MAINNET_SUSDE;
  // const params = CAPPED_RATES_PARAMS_MAINNET_CSUSDL;
  // const params = CAPPED_RATES_PARAMS_BASE_YOETH;
  // const params = CAPPED_RATES_PARAMS_BASE_YOUSD;
  // const params = CAPPED_RATES_PARAMS_BASE_YOBTC;
  // const params = CAPPED_RATES_PARAMS_BASE_RSETH;
  // const params = CAPPED_RATES_PARAMS_ARBITRUM_RSETH;
  // const params = CAPPED_RATES_PARAMS_ARBITRUM_SUSDAI;
  // const params = CAPPED_RATES_PARAMS_MAINNET_LBTC;
  // const params = CAPPED_RATES_PARAMS_BASE_WSTUSR;
  // const params = CAPPED_RATES_PARAMS_ARBITRUM_WSTUSR;
  // const params = CAPPED_RATES_PARAMS_ARBITRUM_SYRUPUSDC;
  // const params = CAPPED_RATES_PARAMS_ARBITRUM_SUSDE;
  // const params = CAPPED_RATES_PARAMS_BASE_SYRUPUSDC;
  // const params = CAPPED_RATES_PARAMS_MAINNET_SYRUPUSDC;
  // const params = CAPPED_RATES_PARAMS_ARBITRUM_EZETH;
  // const params = CAPPED_RATES_PARAMS_PLASMA_SUSDE;
  // const params = CAPPED_RATES_PARAMS_PLASMA_SYRUPUSDT;
  // const params = CAPPED_RATES_PARAMS_PLASMA_WEETH;
  // const params = CAPPED_RATES_PARAMS_PLASMA_WSTUSR;
  // const params = CAPPED_RATES_PARAMS_ARBITRUM_RLP;
  // const params = CAPPED_RATES_PARAMS_BASE_SUSDE;
  // const params = CAPPED_RATES_PARAMS_PLASMA_SUSDAI;
  // const params = CAPPED_RATES_PARAMS_BASE_EZETH;
  // const params = CAPPED_RATES_PARAMS_PLASMA_WRSETH;
  // const params = CAPPED_RATES_PARAMS_MAINNET_SYRUPUSDT;
  // const params = CAPPED_RATES_PARAMS_MAINNET_JRUSDE;
  // const params = CAPPED_RATES_PARAMS_MAINNET_SRUSDE;
  const params = CAPPED_RATES_PARAMS_MAINNET_OSETH;

  params.params.liquidity = (await hre.deployments.get("Liquidity")).address;

  await deployCappedRate(
    hre,
    version,
    params.tokenSymbol,
    params.fullyQualifiedName,
    params.params,
    (params as any).rateSource2
  );

  // use below to deploy a center price invert from a FluidCappedRate (comment out deployCappedRate above and comment in below)
  // const name = "CenterPrice_BTC_LBTC";
  // const infoName = "LBTC per 1 BTC";
  // const fluidCappedRateAddress = (
  //   await hre.deployments.get(getFluidCappedRateName(params.fullyQualifiedName, params.tokenSymbol, params.params))
  // ).address;
  // await deployFluidCappedRateInvertCenterPrice(hre, version, name, infoName, fluidCappedRateAddress);

  logSuccess("Deployed FluidCappedRate successfully!");
  logDebug("-----------------------------------------\n\n");
};

// Todo replace previous contract rates? See below

// export const deployContractRateEZETH = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/ezeth/main.sol:EZETHContractRate",
//     "EZETH <> ETH exchange rate",
//     EZETH_BALANCER_RATE_PROVIDER,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateEBTC = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/ebtc/main.sol:EBTCContractRate",
//     "EBTC <> BTC exchange rate",
//     EBTC_ACCOUNTANT,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateLBTC = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/lbtc/main.sol:LBTCContractRate",
//     "LBTC <> BTC exchange rate",
//     LBTC_FUNDAMENTAL_REDSTONE_ORACLE,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateRSETH = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/rseth/main.sol:RsETHContractRate",
//     "rsETH <> ETH exchange rate",
//     RSETH_LRT_ORACLE,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateWEETH = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/weeth/main.sol:WEETHContractRate",
//     "weETH <> eETH exchange rate",
//     TOKENS_MAINNET.WEETH.address,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateWEETHS = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/weeths/main.sol:WeETHsContractRate",
//     "weETHs <> eETH exchange rate",
//     WEETHS_ACCOUNTANT,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateWSTETH = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/wsteth/main.sol:WstETHContractRate",
//     "wstETH <> stETH exchange rate",
//     TOKENS_MAINNET.WSTETH.address,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateSUSDE = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/susde/main.sol:SUSDEContractRate",
//     "sUSDE <> USDE exchange rate",
//     TOKENS_MAINNET.SUSDE.address,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };

// export const deployContractRateSUSDS = async (
//   hre: HardhatRuntimeEnvironment,
//   version: FluidVersion,
//   minUpdateDiffPercent: number,
//   minHeartRate: number
// ) => {
//   return deployContractRate(
//     hre,
//     version,
//     "contracts/oracle/contractRates/susds/main.sol:SUSDSContractRate",
//     "sUSDS <> USDS exchange rate",
//     TOKENS_MAINNET.SUSDS.address,
//     minUpdateDiffPercent,
//     minHeartRate
//   );
// };
