import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  FluidDexT1DeploymentLogic__factory,
  FluidDexT1OperationsCol__factory,
  FluidDexT1OperationsDebt__factory,
  FluidDexT1PerfectOperationsAndSwapOut__factory,
  FluidDexT1__factory,
} from "../../../../typechain-types";

import { FluidVersion } from "../../../settings";
import { contractFullyQualifiedName, deployerSigner, logDebug, verify } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion, copyLogFiles } from "../../util";
import { deployViaSStore2, deployViaSStore2CodeSplit } from "./deploy-via-sstore2";

export const deployDexT1DeploymentLogic = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  // constructor args:
  // address liquidity_,
  // address dexFactory_,
  // address contractDeployer_,
  // address colOperations_,
  // address debtOperations_,
  // address perfectOperationsAndSwapOut_,
  // address mainAddress1_,
  // address mainAddress2_
  const liquidity = await hre.deployments.get("Liquidity");
  const dexFactory = await hre.deployments.get("DexFactory");
  const deployerFactory = await hre.deployments.get("DeployerFactory");

  let currentDeployment = await hre.deployments.getOrNull("DexT1DeploymentLogic");
  if (currentDeployment) {
    await runVerifications(hre, version, deployerFactory.address, dexFactory.address);
    throw new Error("DexT1DeploymentLogic is already deployed! fix manually.");
  }

  logDebug("Deploying debtOperations via SSTORE2");
  const debtOperations = await deployViaSStore2(hre, FluidDexT1OperationsDebt__factory.bytecode);

  logDebug("Deploying colOperations via SSTORE2");
  const colOperations = await deployViaSStore2(hre, FluidDexT1OperationsCol__factory.bytecode);

  logDebug("Deploying perfectOperationsAndSwapOut via SSTORE2");
  const { pointer1: perfectOperationsAndSwapOut1, pointer2: perfectOperationsAndSwapOut2 } =
    await deployViaSStore2CodeSplit(hre, FluidDexT1PerfectOperationsAndSwapOut__factory.bytecode);

  logDebug("Deploying main via SSTORE2");
  const { pointer1: mainImplementation1, pointer2: mainImplementation2 } = await deployViaSStore2CodeSplit(
    hre,
    FluidDexT1__factory.bytecode
  );

  const deployedAddress = await deploy(
    hre,
    "DexT1DeploymentLogic",
    "contracts/protocols/dex/factory/deploymentLogics/poolT1Logic.sol:FluidDexT1DeploymentLogic",
    version,
    [
      liquidity.address,
      dexFactory.address,
      deployerFactory.address,
      colOperations,
      debtOperations,
      perfectOperationsAndSwapOut1,
      perfectOperationsAndSwapOut2,
      mainImplementation1,
      mainImplementation2,
    ]
  );

  await runVerifications(hre, version, deployerFactory.address, dexFactory.address);

  return deployedAddress;
};

const runVerifications = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  deployerFactory: string,
  dexFactory: string
) => {
  let currentDeployment = await hre.deployments.get("DexT1DeploymentLogic");

  const deployer = await deployerSigner(hre);
  const deploymentLogic = FluidDexT1DeploymentLogic__factory.connect(currentDeployment.address, deployer);

  let deployedAddress = await deploymentLogic.ADMIN_IMPLEMENTATION();
  let name = "DexT1Admin";
  let fullyQualifiedName = contractFullyQualifiedName(
    "FluidDexT1Admin",
    "contracts/protocols/dex/poolT1/adminModule/main.sol"
  );
  let constructorArgs: any = [];
  let artifact = await hre.deployments.getArtifact(fullyQualifiedName);

  await verify(hre, name, fullyQualifiedName, deployedAddress, constructorArgs);
  // save output log data to ./deployments/<network>/ folder. must be manually triggered because of custom deployment
  await hre.deployments.save(name, {
    abi: artifact.abi,
    address: deployedAddress,
    args: constructorArgs,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
    // receipt not available
    transactionHash: currentDeployment.transactionHash,
  });
  // wite to log files if contract is newly deployed
  copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);

  deployedAddress = await deploymentLogic.MINI_DEPLOYER();
  name = "MiniDeployer";
  fullyQualifiedName = contractFullyQualifiedName(
    "MiniDeployer",
    "contracts/protocols/dex/factory/deploymentHelpers/miniDeployer.sol"
  );
  constructorArgs = [dexFactory];

  await verify(hre, name, fullyQualifiedName, deployedAddress, constructorArgs);
  // save output log data to ./deployments/<network>/ folder. must be manually triggered because of custom deployment
  await hre.deployments.save(name, {
    abi: artifact.abi,
    address: deployedAddress,
    args: constructorArgs,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
    // receipt not available
    transactionHash: currentDeployment.transactionHash,
  });
  // write to log files if contract is newly deployed
  copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);

  deployedAddress = await deploymentLogic.SHIFT_IMPLEMENTATION();
  name = "DexT1Shift";
  fullyQualifiedName = contractFullyQualifiedName(
    "FluidDexT1Shift",
    "contracts/protocols/dex/poolT1/coreModule/core/shift.sol"
  );
  constructorArgs = [deployerFactory];

  await verify(hre, name, fullyQualifiedName, deployedAddress, constructorArgs);
  // save output log data to ./deployments/<network>/ folder. must be manually triggered because of custom deployment
  await hre.deployments.save(name, {
    abi: artifact.abi,
    address: deployedAddress,
    args: constructorArgs,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
    // receipt not available
    transactionHash: currentDeployment.transactionHash,
  });
  // wite to log files if contract is newly deployed
  copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);
};
