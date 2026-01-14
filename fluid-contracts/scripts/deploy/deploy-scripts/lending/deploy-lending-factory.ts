import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployLendingFactory = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const liquidity = await hre.deployments.get("Liquidity");

  let owner = throwIfAddressZero(coreContractsConfig().lending.lendingFactory.owner, "LendingFactory Owner");

  const deployedAddress = await deploy(
    hre,
    "LendingFactory",
    "contracts/protocols/lending/lendingFactory/main.sol:FluidLendingFactory",
    version,
    // constructor args: liquidity address, owner
    [liquidity.address, owner]
  );

  return deployedAddress;
};
