import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployLiquidatorImplementationContract = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  fla: string,
  weth: string
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, fla, weth);

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string]
) => {
  const fla = throwIfAddressZero(args[0], "VaultLiquidatorImplementation FLA");
  const weth = throwIfAddressZero(args[1], "VaultLiquidatorImplementation WETH");

  const deployedAddress = await deploy(
    hre,
    "VaultLiquidatorImplementationV1",
    "contracts/periphery/liquidation/implementations/implementationsV1.sol:VaultLiquidatorImplementationV1",
    version,
    [fla, weth]
  );
  return deployedAddress;
};
