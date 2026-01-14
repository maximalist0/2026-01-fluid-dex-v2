import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployMigrationContract = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  owner: string,
  flaContract: string,
  weth: string,
  oldFactory: string,
  newFactory: string
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
    oldFactory,
    newFactory
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, string, string, string]
) => {
  const owner = throwIfAddressZero(args[0], "VaultT1Migrator owner");
  const fla = throwIfAddressZero(args[1], "VaultT1Migrator fla");
  const weth = throwIfAddressZero(args[2], "VaultT1Migrator weth");
  const oldFactory = throwIfAddressZero(args[3], "VaultT1Migrator weth");
  const newFactory = throwIfAddressZero(args[4], "VaultT1Migrator weth");

  const deployedAddress = await deploy(
    hre,
    "VaultT1Migrator",
    "contracts/periphery/migration/main.sol:VaultT1Migrator",
    version,
    [owner, fla, weth, oldFactory, newFactory]
  );
  return deployedAddress;
};
