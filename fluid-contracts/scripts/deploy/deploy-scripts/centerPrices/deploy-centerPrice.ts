import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  ChainlinkCenterPriceL2Config,
  GenericCenterPriceConfig,
  GenericCenterPriceL2Config,
} from "../../../settings/add-vault-configs/add-vault-interfaces";
import { FluidVersion } from "../../../settings";
import { deployChainlinkCenterPriceL2 } from "./deploy-centerPrice-chainlinkCenterPriceL2";
import { deployGenericCenterPrice } from "./deploy-centerPrice-genericCenterPrice";

export const deployCenterPrice = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  centerPriceConfig: ChainlinkCenterPriceL2Config | GenericCenterPriceConfig | GenericCenterPriceL2Config
) => {
  switch (centerPriceConfig.contractName) {
    case "FluidGenericCenterPrice":
      centerPriceConfig = centerPriceConfig as GenericCenterPriceConfig;
      await deployGenericCenterPrice(hre, version, centerPriceConfig.centerPriceName, false, [
        centerPriceConfig.infoName,
        centerPriceConfig.sources,
      ]);
      break;
    case "FluidGenericCenterPriceL2":
      centerPriceConfig = centerPriceConfig as GenericCenterPriceL2Config;
      await deployGenericCenterPrice(hre, version, centerPriceConfig.centerPriceName, true, [
        centerPriceConfig.infoName,
        centerPriceConfig.sources,
      ]);
      break;
    case "ChainlinkCenterPriceL2":
      centerPriceConfig = centerPriceConfig as ChainlinkCenterPriceL2Config;
      // constructor args:
      // string memory infoName_,
      // ChainlinkOracleImpl.ChainlinkConstructorParams memory clParams_,
      // address sequencerUptimeFeed_
      await deployChainlinkCenterPriceL2(hre, version, centerPriceConfig.centerPriceName, [
        centerPriceConfig.infoName,
        centerPriceConfig.clParams,
      ]);
      break;
    default:
      throw new Error("Center price type deployment not implemented");
  }
};
