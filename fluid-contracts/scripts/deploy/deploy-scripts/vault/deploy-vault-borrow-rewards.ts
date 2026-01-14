import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployVaultBorrowRewards = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  vault: string,
  duration: number,
  rewardsAmount: BigNumber,
  initiator: string,
  borrowToken: string,
  vaultName: string,
  governance: string
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    vault,
    duration,
    rewardsAmount,
    initiator,
    borrowToken,
    vaultName,
    governance
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, number, BigNumber, string, string, string, string]
) => {
  const vault = throwIfAddressZero(args[0], "VaultBorrowRewards vault");
  const duration = args[1];
  const rewardsAmount = args[2];
  const initiator = throwIfAddressZero(args[3], "VaultBorrowRewards initiator");
  const borrowToken = args[4];
  const vaultName = args[5];
  const governance = throwIfAddressZero(args[6], "VaultBorrowRewards Governance");

  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;
  const liquidity = (await hre.deployments.get("Liquidity")).address;

  const name = vaultName + "_VaultBorrowRewards";

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/protocols/vault/borrowRewards/main.sol:FluidVaultBorrowRewards",
    version,
    /// @notice Constructs the FluidVaultBorrowRewards contract.
    /// @param reserveContract_ The address of the reserve contract where rebalancers are defined.
    /// @param vault_ The vault to which this contract will apply new magnifier parameter.
    /// @param liquidity_ Fluid liquidity address
    /// @param rewardsAmt_ Amounts of rewards to distribute
    /// @param duration_ rewards duration
    /// @param initiator_ address that can start rewards with `start()`
    /// @param debtToken_ vault debt token address
    /// @param governance_ governance address
    [reserveContract, vault, liquidity, rewardsAmount, duration, initiator, borrowToken, governance]
  );
  return deployedAddress;
};
