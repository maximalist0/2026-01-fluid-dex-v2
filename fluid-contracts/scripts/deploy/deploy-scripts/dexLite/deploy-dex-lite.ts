import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deployerAddress } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployDexLite = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor args:
  // address auth_, address deployerContract_, address liquidity_

  // const auth = "0x4F6F977aCDD1177DCD81aB83074855EcB9C2D49e"; // Team Multisig
  const auth = await deployerAddress(hre);
  const liquidity = await hre.deployments.get("Liquidity");
  const deployerContract = await hre.deployments.get("DeployerFactory");

  const deployedAddress = await deploy(
    hre,
    "FluidDexLite",
    "contracts/protocols/dexLite/core/main.sol:FluidDexLite",
    version,
    [auth, liquidity.address, deployerContract.address]
  );
  return deployedAddress;
}; 