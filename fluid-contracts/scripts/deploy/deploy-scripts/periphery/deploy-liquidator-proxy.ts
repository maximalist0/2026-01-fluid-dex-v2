import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployLiquidatorProxyContract = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  owner: string,
  rebalancers: string[],
  implementations: string[]
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    owner,
    rebalancers,
    implementations
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string[], string[]]
) => {
  const owner = throwIfAddressZero(args[0], "VaultLiquidator owner");
  const rebalancers = args[1].map((a) => throwIfAddressZero(a, "VaultLiquidator rebalancer"));
  const implementations = args[2].map((a) => throwIfAddressZero(a, "VaultLiquidator rebalancer"));

  const deployedAddress = await deploy(
    hre,
    "VaultLiquidator",
    "contracts/periphery/liquidation/proxy.sol:VaultLiquidator",
    version,
    [owner, rebalancers, implementations]
  );
  return deployedAddress;
};
