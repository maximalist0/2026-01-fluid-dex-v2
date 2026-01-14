import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployDexLiteAdminModule = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor args:
  // address deployerContract_, address liquidity_

  const liquidity = await hre.deployments.get("Liquidity");
  const deployerContract = await hre.deployments.get("DeployerFactory");

  const deployedAddress = await deploy(
    hre,
    "FluidDexLiteAdminModule",
    "contracts/protocols/dexLite/adminModule/main.sol:FluidDexLiteAdminModule",
    version,
    [liquidity.address, deployerContract.address]
  );
  return deployedAddress;
}; 