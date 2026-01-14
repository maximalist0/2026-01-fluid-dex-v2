import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployVaultFactory = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor args:
  // address owner_

  let owner = throwIfAddressZero(coreContractsConfig().vault.vaultFactory.owner, "VaultFactory Owner");

  const deployedAddress = await deploy(
    hre,
    "VaultFactory",
    "contracts/protocols/vault/factory/main.sol:FluidVaultFactory",
    version,
    [owner]
  );
  return deployedAddress;
};
