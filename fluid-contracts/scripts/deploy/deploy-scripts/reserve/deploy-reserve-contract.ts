import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployReserveContract = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const TREASURY_ADDRESS = "0x28849D2b63fA8D361e5fc15cB8aBB13019884d09";
  const BUYBACK_CONTRACT_ADDRESS = "0x9Afb8C1798B93a8E04a18553eE65bAFa41a012F1";

  const deployedAddress = await deploy(
    hre,
    "ReserveContract",
    "contracts/reserve/main.sol:FluidReserveContract",
    version,
    [TREASURY_ADDRESS, BUYBACK_CONTRACT_ADDRESS]
  );
  return deployedAddress;
};
