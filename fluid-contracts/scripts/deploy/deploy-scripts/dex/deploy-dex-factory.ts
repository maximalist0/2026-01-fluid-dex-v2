import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployDexFactory = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor args:
  // address owner_

  let owner = throwIfAddressZero(coreContractsConfig().dex.dexFactory.owner, "DexFactory Owner");

  const deployedAddress = await deploy(
    hre,
    "DexFactory",
    "contracts/protocols/dex/factory/main.sol:FluidDexFactory",
    version,
    [owner]
  );
  return deployedAddress;
};
