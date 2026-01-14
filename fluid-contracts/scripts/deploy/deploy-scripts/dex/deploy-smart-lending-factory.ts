import { HardhatRuntimeEnvironment } from "hardhat/types";

import { coreContractsConfig, FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deploySmartLendingFactory = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor args:
  // address dexFactory_,
  // address liquidity_,
  // address owner_,

  const dexFactory = (await hre.deployments.get("DexFactory")).address;
  const liquidity = (await hre.deployments.get("Liquidity")).address;
  const owner = throwIfAddressZero(coreContractsConfig().dex.smartLendingFactory.owner, "SmartLendingFactory Owner");

  const deployedAddress = await deploy(
    hre,
    "SmartLendingFactory",
    "contracts/protocols/dex/smartLending/factory/main.sol:FluidSmartLendingFactory",
    version,
    [dexFactory, liquidity, owner]
  );
  return deployedAddress;
};
