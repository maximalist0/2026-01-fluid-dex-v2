import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../../settings";
import { throwIfAddressZero } from "../../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../../util";

export const deployWalletFactory = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const vaultFactory = await hre.deployments.get("VaultFactory");
  const fluidWalletFactoryProxy = await hre.deployments.get("FluidWalletFactoryProxy");

  const deployedAddress = await deploy(
    hre,
    "FluidWalletFactory",
    "contracts/periphery/wallet/factory/main.sol:FluidWalletFactory",
    version,
    // constructor args: vault T1 Factory address, wallet factory proxy address
    [vaultFactory.address, fluidWalletFactoryProxy.address]
  );
  return deployedAddress;
};
