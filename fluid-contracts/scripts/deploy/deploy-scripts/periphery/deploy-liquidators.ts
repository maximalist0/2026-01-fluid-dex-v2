import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion, peripheryContractsConfig } from "../../../settings";
import { deployLiquidationContract } from "./deploy-liquidation-contract";
import { deployLiquidatorImplementationContract } from "./deploy-liquidator-implementation";
import { deployLiquidatorProxyContract } from "./deploy-liquidator-proxy";

export const deployLiquidators = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const config = peripheryContractsConfig(hre.network.name);
  const implementationsV1 = await deployLiquidatorImplementationContract(
    hre,
    version,
    config.liquidation.fla,
    config.liquidation.weth
  );

  await deployLiquidatorProxyContract(hre, version, config.liquidation.owner, config.liquidation.rebalancers, [
    implementationsV1,
  ]);

  await deployLiquidationContract(
    hre,
    version,
    config.liquidation.owner,
    config.liquidation.fla,
    config.liquidation.weth,
    config.liquidation.rebalancers
  );
};
