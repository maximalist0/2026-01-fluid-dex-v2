import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { AVOCADO_TEAM_MULTISIG } from "../../../settings/contract-addresses";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployWithdrawLimitAuth = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;
  const liquidity = (await hre.deployments.get("Liquidity")).address;

  const name = "WithdrawLimitAuth";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/withdrawLimitAuth/main.sol:FluidWithdrawLimitAuth",
    version,
    // constructor args:
    // IFluidReserveContract reserveContract_,
    // address liquidity_,
    // address multisig_
    [reserveContract, liquidity, AVOCADO_TEAM_MULTISIG]
  );
  return deployedAddress;
};
