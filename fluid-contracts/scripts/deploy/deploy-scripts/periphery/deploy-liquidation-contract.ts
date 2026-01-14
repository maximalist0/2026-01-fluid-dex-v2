import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployLiquidationContract = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  owner: string,
  flaContract: string,
  weth: string,
  rebalancers: string[]
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    owner,
    flaContract,
    weth,
    rebalancers
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, string, string[]]
) => {
  const owner = throwIfAddressZero(args[0], "VaultT1Liquidator owner");
  const fla = throwIfAddressZero(args[1], "VaultT1Liquidator fla");
  const weth = throwIfAddressZero(args[2], "VaultT1Liquidator weth");
  const rebalancers = args[3].map((a) => throwIfAddressZero(a, "VaultT1Liquidator rebalancer"));

  const deployedAddress = await deploy(
    hre,
    "VaultT1Liquidator",
    "contracts/periphery/liquidation/main.sol:VaultT1Liquidator",
    version,
    [owner, fla, weth, rebalancers]
  );
  return deployedAddress;
};
