import { defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import { ABI } from "hardhat-deploy/dist/types";
import { ContractFactory, ContractReceipt, Event } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { copyLogFiles } from "./deploy-helpers";
import { FluidVersion, deploymentsConfig } from "../../settings";
import {
  contractFullyQualifiedName,
  deployerAddress,
  getContractSuccessReceipt,
  logDebug,
  logSuccess,
  verify,
} from "../../util";

const instadappCreate3Factory = async (hre: HardhatRuntimeEnvironment, deployer: SignerWithAddress) => {
  return await hre.ethers.getContractAt(CREATE3FactoryAbi, deploymentsConfig.instadappCreate3FactoryAddress, deployer);
};

const buildCreate3Salt = async (
  hre: HardhatRuntimeEnvironment,
  contractFullyQualifiedName: string,
  version: FluidVersion,
  salt = ""
) => {
  // CREATE3 deployment depends _only_ on salt so we customize it with contract bytecode + version
  // Note for our use-cases we only need to remove dependency of deterministic address on constructor args,
  // but not on bytecode so this is ideal for avoiding collisions
  return solidityKeccak256(
    ["string"],
    [
      (await hre.deployments.getArtifact(contractFullyQualifiedName)).bytecode +
        version +
        deploymentsConfig.deterministicDeploymentSalt +
        salt,
    ]
  );
};

export const deployCREATE3 = async (
  hre: HardhatRuntimeEnvironment,
  name: string,
  contractPath: string,
  version: FluidVersion,
  constructorTypes: string[],
  constructorArgs: any[],
  skipVerify = false,
  from?: string
): Promise<{ deployedAddress: string; newlyDeployed: boolean }> => {
  if (!from) {
    const deployer = await deployerAddress(hre);
    from = deployer;
  }
  logDebug("\n----------------------------------------- \nDeploying", name, "for", version.replace(/_/g, ".") + ":");

  const fullyQualifiedName = contractFullyQualifiedName(name, contractPath);

  const contractFactory = (await hre.ethers.getContractFactory(fullyQualifiedName)) as ContractFactory & { abi: ABI };

  const deployerSigner = await hre.ethers.getSigner(from);

  // deploy logic contract using CREATE3 factory https://github.com/Instadapp/create3-factory
  let create3Salt = await buildCreate3Salt(hre, fullyQualifiedName, version);
  const create3Factory = await instadappCreate3Factory(hre, deployerSigner);

  // make sure create3Factory is deployed on network
  const create3FactoryCode = await hre.ethers.provider.getCode(create3Factory.address);
  if (create3FactoryCode === "" || create3FactoryCode === "0x") {
    throw new Error(
      "Create3 Factory code does not exist. Check instadappCreate3FactoryAddress in deployments.config.ts"
    );
  }

  const deployedAddress = await create3Factory.getDeployed(create3Salt);

  // get the creation code data
  const constructorParams = defaultAbiCoder.encode(constructorTypes, constructorArgs);
  // Concatenate the creation code and constructor params
  const create3CreationCode = contractFactory.bytecode + constructorParams.substring(2);

  // file paths for the dump log file
  const dumpLogsPath = `deployments/${hre.network.name}/dump/`;
  const expectedDumpLogFilePath = `${dumpLogsPath}${deployedAddress}.json`;

  let newlyDeployed = true;

  // check if deployment already exists at this salt
  if ((await hre.ethers.provider.getCode(deployedAddress)) != "0x") {
    // code already exists, compare with our log files
    if (fs.existsSync(expectedDumpLogFilePath)) {
      // file exists -> check our log file data to check if constructor args are the same (via creation code)
      const log = JSON.parse(fs.readFileSync(expectedDumpLogFilePath) as unknown as string);
      if (
        defaultAbiCoder.encode(constructorTypes, log.args) == constructorParams &&
        log.deployedBytecode == create3CreationCode
      ) {
        // exact same contract already deployed -> return address
        newlyDeployed = false;
      } else {
        // bytecode matches deployed contract but constructor args differ -> create variation in salt with timestamp
        // and continue deployment
        create3Salt = await buildCreate3Salt(hre, fullyQualifiedName, version, new Date().getTime().toString());
      }
    } else {
      // no easy way to check constructor args -> revert and let dev manually decide what to do
      throw new Error(
        `!! ERROR: CREATE3 deployment deployment with this salt already exists but is not in logs dump!
         Note: check if constructor args are matching, if so, no deployment needed! Otherwise update version or deterministic hash.`
      );
    }
  }

  let receipt: ContractReceipt;
  if (newlyDeployed) {
    const tx = await create3Factory.deploy(create3Salt, create3CreationCode, {
      gasLimit: await create3Factory.estimateGas.deploy(create3Salt, create3CreationCode),
    });

    receipt = await getContractSuccessReceipt(hre, tx);

    // make sure actual deployed address matches the calculated one
    const deployedAddressFromEvents = (receipt.events as Event[])[0].address;
    if (deployedAddressFromEvents != deployedAddress) {
      throw new Error("!! ERROR: CREATE3 deployment unexpected deployed address");
    }

    // save output log data to ./deployments/<network>/ folder. must be manually triggered, see
    // https://github.com/wighawag/hardhat-deploy/issues/208#issuecomment-1574261025
    await hre.deployments.save(name, {
      abi: contractFactory.abi,
      address: deployedAddress,
      args: constructorArgs,
      bytecode: contractFactory.bytecode,
      receipt: receipt,
      transactionHash: receipt.transactionHash,
      deployedBytecode: create3CreationCode,
    });
  }

  if (newlyDeployed) {
    // wite to log files if contract is newly deployed
    copyLogFiles(hre.network.name, name, version, deployedAddress, constructorArgs, create3Salt);

    logSuccess(`\nNewly deployed ${name} (with CREATE3) to: ${deployedAddress}`);

    logDebug(
      `\nconstructorArgs for the deployment were: ${JSON.stringify(constructorArgs)}.\ntx hash: ${
        receipt!.transactionHash
      }\n`
    );
  } else {
    logDebug(`\nAlready had deployed ${name} to: ${deployedAddress}. See version log files for more.\n`);
  }

  if (!skipVerify) {
    // verify contract at block explorer of current network
    await verify(hre, name, fullyQualifiedName, deployedAddress, constructorArgs);
  }

  return { deployedAddress, newlyDeployed };
};

const CREATE3FactoryAbi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "creationCode",
        type: "bytes",
      },
    ],
    name: "deploy",
    outputs: [
      {
        internalType: "address",
        name: "deployed",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "getDeployed",
    outputs: [
      {
        internalType: "address",
        name: "deployed",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
