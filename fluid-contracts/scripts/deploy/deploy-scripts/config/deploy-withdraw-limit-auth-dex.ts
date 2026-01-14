import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { AVOCADO_TEAM_MULTISIG } from "../../../settings/contract-addresses";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployWithdrawLimitAuthDex = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;

  const name = "WithdrawLimitAuthDex";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/withdrawLimitAuthDex/main.sol:FluidWithdrawLimitAuthDex",
    version,
    // constructor args:
    // IFluidReserveContract reserveContract_,
    // address multisig_
    [reserveContract, AVOCADO_TEAM_MULTISIG]
  );
  return deployedAddress;
};
