import { HardhatRuntimeEnvironment } from "hardhat/types";

import { contractFullyQualifiedName, deployerSigner, verify } from "../../../../util";
import { FluidVersion, getVaultTypeName, VAULT_TYPE } from "../../../../settings";
import { DeployFunction, deploy, executeDeployFunctionForVersion, copyLogFiles } from "../../../util";
import {
  FluidVaultT2DeploymentLogic__factory,
  FluidVaultT2Operate__factory,
  FluidVaultT2__factory,
  FluidVaultT3DeploymentLogic__factory,
  FluidVaultT3Operate__factory,
  FluidVaultT3__factory,
  FluidVaultT4DeploymentLogic__factory,
  FluidVaultT4Operate__factory,
  FluidVaultT4__factory,
} from "../../../../../typechain-types";
import { deployViaSStore2, deployViaSStore2CodeSplit } from "../../dex/deploy-via-sstore2";
import { deployVaultT234Admin } from "./deploy-vaultT234-admin";
import { deployVaultT234Secondary } from "./deploy-vaultT234-secondary";

export const deployVaultT234DeploymentLogic = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  vaultType: VAULT_TYPE
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, vaultType);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion, args: [VAULT_TYPE]) => {
  const vaultType = args[0];

  const name = `${getVaultTypeName(vaultType)}DeploymentLogic`;

  const vaultFactory = await hre.deployments.get("VaultFactory");

  let currentDeployment = await hre.deployments.getOrNull(name);
  if (currentDeployment) {
    await runVerifications(hre, version, vaultType, name, vaultFactory.address);
    throw new Error(name + " is already deployed! fix manually.");
  }

  // constructor args:
  // address liquidity_,
  // address vaultFactory_,
  // address deployer_,
  // address vaultAdminImplementation_,
  // address vaultSecondaryImplementation_,
  // address vaultOperateImplementation_,
  // address vaultMainImplementation_
  const liquidity = await hre.deployments.get("Liquidity");
  const deployerFactory = await hre.deployments.get("DeployerFactory");
  const vaultAdmin = await deployVaultT234Admin(hre, version, vaultType);
  const vaultSecondary = await deployVaultT234Secondary(hre, version);
  const vaultOperate = await deployViaSStore2(hre, getVaultTypeOperateBytecode(vaultType));
  let vaultMain: string;
  let vaultMain2: string;
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    const { pointer1, pointer2 } = await deployViaSStore2CodeSplit(hre, getVaultTypeMainBytecode(vaultType));
    vaultMain = pointer1;
    vaultMain2 = pointer2;
  } else {
    vaultMain = await deployViaSStore2(hre, getVaultTypeMainBytecode(vaultType));
  }

  const path = `contracts/protocols/vault/factory/deploymentLogics/${getVaultTypeName(vaultType).replace(
    "V",
    "v"
  )}Logic.sol:Fluid${name}`;

  const constructorArgs = [
    liquidity.address,
    vaultFactory.address,
    deployerFactory.address,
    vaultAdmin,
    vaultSecondary,
    vaultOperate,
    vaultMain,
  ];

  if (vaultType == VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    if (!vaultMain2!) {
      throw new Error("vaultMain2 not defined");
    }
    constructorArgs.push(vaultMain2!);
  }

  const deployedAddress = await deploy(hre, name, path, version, constructorArgs);

  await runVerifications(hre, version, vaultType, name, vaultFactory.address);

  return deployedAddress;
};

const runVerifications = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  vaultType: VAULT_TYPE,
  deploymentLogicsName: string,
  vaultFactory: string
) => {
  let currentDeployment = await hre.deployments.get(deploymentLogicsName);

  const deployer = await deployerSigner(hre);
  const deploymentLogic = getVaultTypeDeploymentLogicFactory(vaultType).connect(currentDeployment.address, deployer);

  let deployedAddress = await deploymentLogic.MINI_DEPLOYER();
  let name = "MiniDeployerVault";
  let fullyQualifiedName = contractFullyQualifiedName(
    "MiniDeployer",
    "contracts/protocols/vault/factory/deploymentHelpers/miniDeployer.sol"
  );
  let constructorArgs = [vaultFactory];
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
  // write to log files if contract is newly deployed
  copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);
};

const getVaultTypeOperateBytecode = (vaultType: VAULT_TYPE): string => {
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    return FluidVaultT2Operate__factory.bytecode;
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    return FluidVaultT3Operate__factory.bytecode;
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    return FluidVaultT4Operate__factory.bytecode;
  }

  throw new Error("Vault Type not exist");
};

const getVaultTypeMainBytecode = (vaultType: VAULT_TYPE): string => {
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    return FluidVaultT2__factory.bytecode;
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    return FluidVaultT3__factory.bytecode;
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    return FluidVaultT4__factory.bytecode;
  }

  throw new Error("Vault Type not exist");
};

const getVaultTypeDeploymentLogicFactory = (vaultType: VAULT_TYPE): any => {
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    return FluidVaultT2DeploymentLogic__factory;
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    return FluidVaultT3DeploymentLogic__factory;
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    return FluidVaultT4DeploymentLogic__factory;
  }

  throw new Error("Vault Type not exist");
};
