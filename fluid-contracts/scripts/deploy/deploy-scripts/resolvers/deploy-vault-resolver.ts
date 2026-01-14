import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";

export const deployVaultResolver = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor takes vault factory, liquidity resolver
  const vaultFactory = await hre.deployments.get("VaultFactory");
  const liquidityResolver = await hre.deployments.get("LiquidityResolver");

  const deployedAddress = await deploy(
    hre,
    "VaultResolver",
    "contracts/periphery/resolvers/vault/main.sol:FluidVaultResolver",
    version,
    [vaultFactory.address, liquidityResolver.address]
  );
  return deployedAddress;
};
