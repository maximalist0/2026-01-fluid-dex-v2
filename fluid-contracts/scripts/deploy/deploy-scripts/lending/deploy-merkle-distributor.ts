import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { deploy, DeployFunction, executeDeployFunctionForVersion } from "../../util";
import { throwIfAddressZero } from "../../../util";

export const deployMerkleDistributor = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  name: string,
  owner: string,
  proposer: string,
  approver: string,
  rewardToken: string,
  distributionInHours: number = 336, // 14 days
  cycleInHours: number = 8, // 8 hours
  startBlock: number = 0,
  pullFromDistributor: boolean = false,
  vestingTime: number = 0,
  vestingStartTime: number = 0
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    name,
    owner,
    proposer,
    approver,
    rewardToken,
    distributionInHours, 
    cycleInHours,
    startBlock,
    pullFromDistributor,
    vestingTime,
    vestingStartTime
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, string, string, string, number, number, number, boolean, number, number]
) => {
  const name = args[0] || "Merkle Distribution"
  const owner = throwIfAddressZero(args[1], "MerkleDistributor owner");
  const proposer = throwIfAddressZero(args[2], "MerkleDistributor proposer");
  const approver = throwIfAddressZero(args[3], "MerkleDistributor approver");
  const rewardToken = throwIfAddressZero(args[4], "MerkleDistributor rewardToken");

  const distributionInHours = args[5];
  const cycleInHours = args[6];
  const startBlock = args[7];
  const pullFromDistributor = args[8];
  const vestingTime = args[9];
  const vestingStartTime = args[10];

  const deployedAddress = await deploy(
    hre,
    "MerkleDistributor",
    "contracts/protocols/lending/merkleDistributor/main.sol:FluidMerkleDistributor",
    version,
    //   constructor(string name, address owner_, address proposer_, address rewardToken_, uint256 distributionInHours_, uint256 cycleInHours_, uint256 startBlock_, bool pullFromDistributor_, uint256 vestingTime_, uint256 vestingStartTime_)
    [{
      name,
      owner,
      proposer,
      approver,
      rewardToken,
      distributionInHours,
      cycleInHours,
      startBlock,
      pullFromDistributor,
      vestingTime,
      vestingStartTime,
    }]
  );
  return deployedAddress;
};
