import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";

import {
  IERC20Metadata__factory,
  FluidVaultFactory,
  FluidVaultFactory__factory,
  FluidVaultT1DeploymentLogic,
  FluidVaultT1DeploymentLogic__factory,
} from "../../../../typechain-types";
import { Structs } from "../../../../typechain-types/contracts/protocols/vault/vaultT1/coreModule/constantVariables.sol/ConstantVariables";

import { FluidVersion, VAULT_TYPE } from "../../../settings";
import { NATIVE_TOKEN } from "../../../settings/token-addresses";
import {
  calculateDoubleMappingStorageSlot,
  calculateMappingStorageSlot,
  contractFullyQualifiedName,
  deployerSigner,
  getTokenSymbol,
  LiquiditySlotsLink,
  logDebug,
  logSuccess,
  throwIfAddressZero,
  TxQueue,
  verify,
} from "../../../util";
import { copyLogFiles, DeployFunction, executeDeployFunctionForVersion } from "../../util";
import { getVaultContractName } from "./smartVaults";

export const deployVaultT1 = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  supplyToken: string,
  borrowToken: string,
  addToVaultIdCounter: number
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    supplyToken,
    borrowToken,
    addToVaultIdCounter
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, number]
) => {
  const supplyToken: string = throwIfAddressZero(args[0], "Vault supply token");
  const borrowToken: string = throwIfAddressZero(args[1], "Vault borrow token");
  const addToVaultIdCounter: number = args[2];
  const deployer = await deployerSigner(hre);

  const vaultFactory = FluidVaultFactory__factory.connect(
    (await hre.deployments.get("VaultFactory")).address,
    deployer
  );
  const vaultT1DeploymentLogic = FluidVaultT1DeploymentLogic__factory.connect(
    (await hre.deployments.get("VaultT1DeploymentLogic")).address,
    deployer
  );
  let vaultId = (await vaultFactory.totalVaults()).toNumber() + 1 + addToVaultIdCounter;
  let deployedAddress = await vaultFactory.getVaultAddress(vaultId);

  const name = await getVaultContractName(hre, supplyToken, borrowToken, VAULT_TYPE.T1);
  // must check current deployment like this, as `deployedAddress` differs based on new vaultId
  let currentDeployment = await hre.deployments.getOrNull(name);
  if (!currentDeployment) {
    currentDeployment = await hre.deployments.getOrNull(name.replace("T1", "")); // try with old naming
  }
  if (currentDeployment) {
    // ensure the deployment exists for the current version
    const deploymentsNetworkPath = `deployments/${hre.network.name}/`;
    if (!fs.existsSync(`${deploymentsNetworkPath}${version}/${name}.json`)) {
      currentDeployment = null;
    }
  }
  if (currentDeployment) {
    // if deployment already exists use it to calculate constructor args
    vaultId = (currentDeployment as any).args[0].vaultId;
    deployedAddress = currentDeployment.address;
  }

  // build constructor args as passed in by factory for logs & verification on block explorer:
  const constructorArgs = await getConstructorArgs(
    hre,
    supplyToken,
    borrowToken,
    vaultId,
    deployedAddress,
    vaultFactory,
    vaultT1DeploymentLogic
  );

  logDebug(
    "----------------------------------------- \nDeploying (creating tx data)",
    name,
    "for",
    version.replace(/_/g, ".") + ":"
  );

  const fullyQualifiedName = contractFullyQualifiedName(
    "FluidVaultT1",
    "contracts/protocols/vault/vaultT1/coreModule/main.sol"
  );

  if (!currentDeployment) {
    /// @notice                         Computes vaultT1 bytecode for the given supply token (`supplyToken_`), borrow token (`borrowToken_`), and admin implementation (`adminImplementation_`).
    ///                                 This will be called by the VaultFactory via .delegateCall
    /// @param supplyToken_             The address of the supply token.
    /// @param borrowToken_             The address of the borrow token.
    /// @return vaultCreationBytecode_  Returns the bytecode of the newly vault to deploy.
    const vaultDeploymentData = (await vaultT1DeploymentLogic.populateTransaction.vaultT1(supplyToken, borrowToken))
      .data as string;
    // deployVault Deploys a new vault using the specified deployment logic and data.
    // Only accounts with deployer access or the owner can deploy a new vault.
    const populatedTx = await vaultFactory.populateTransaction.deployVault(
      vaultT1DeploymentLogic.address, // @param vaultDeploymentLogic_    The address of the vault deployment logic contract.
      vaultDeploymentData //  @param vaultDeploymentData_     The data to be used for vault deployment.
    );
    TxQueue.queue(
      populatedTx,
      JSON.stringify(FluidVaultFactory__factory.abi),
      vaultFactory.address,
      FluidVaultFactory__factory.createInterface().getFunction("deployVault").format(),
      {
        vaultDeploymentLogic_: vaultT1DeploymentLogic.address,
        vaultDeploymentData_: vaultDeploymentData,
      }
    );

    const artifact = await hre.deployments.getArtifact(fullyQualifiedName);
    // save output log data to ./deployments/<network>/ folder. must be manually triggered because of custom deployment
    await hre.deployments.save(name, {
      abi: artifact.abi,
      address: deployedAddress,
      args: [constructorArgs],
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
      // receipt not available
      transactionHash: "TODO_SET_AFTER_EXECUTION", // must be set manually in Log files after execution
    });
    // wite to log files if contract is newly deployed
    copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);

    logSuccess(`\nNewly deployed ${name} (via vaultFactory) to: ${deployedAddress}.`);

    logDebug(`\nconstructorArgs for the deployment were: ${JSON.stringify(constructorArgs)}.\n`);
  } else {
    logDebug(
      `\nAlready had deployed ${name} to: ${deployedAddress}. MANUALLY COMPARE IF YOU REALLY WANT TO REPLACE THIS VAULT DEPLOYMENT, IF SO, DELETE LOG FILES BEFORE RUNNING COMMAND AGAIN. See version log files for more.\n`
    );

    // verify contract at block explorer of current network
    await verify(hre, name, fullyQualifiedName, deployedAddress);
  }

  return deployedAddress;
};

const getConstructorArgs = async (
  hre: HardhatRuntimeEnvironment,
  supplyToken: string,
  borrowToken: string,
  vaultId: number,
  deployedAddress: string,
  vaultFactory: FluidVaultFactory,
  vaultT1DeploymentLogic: FluidVaultT1DeploymentLogic
): Promise<Structs.ConstantViewsStruct> => {
  const liquiditySupplyExchangePriceSlot = calculateMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_EXCHANGE_PRICES_MAPPING_SLOT,
    supplyToken
  );
  const liquidityBorrowExchangePriceSlot = calculateMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_EXCHANGE_PRICES_MAPPING_SLOT,
    borrowToken
  );
  const liquidityUserSupplySlot = calculateDoubleMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_USER_SUPPLY_DOUBLE_MAPPING_SLOT,
    deployedAddress,
    supplyToken
  );
  const liquidityUserBorrowSlot = calculateDoubleMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_USER_BORROW_DOUBLE_MAPPING_SLOT,
    deployedAddress,
    borrowToken
  );

  const deployer = await deployerSigner(hre);
  const supplyDecimals =
    supplyToken == NATIVE_TOKEN.address ? 18 : await IERC20Metadata__factory.connect(supplyToken, deployer).decimals();
  const borrowDecimals =
    borrowToken == NATIVE_TOKEN.address ? 18 : await IERC20Metadata__factory.connect(borrowToken, deployer).decimals();

  return {
    liquidity: await vaultT1DeploymentLogic.LIQUIDITY(),
    factory: vaultFactory.address,
    adminImplementation: (await hre.deployments.get("VaultT1Admin")).address,
    secondaryImplementation: (await hre.deployments.get("VaultT1Secondary")).address,
    supplyToken,
    borrowToken,
    supplyDecimals,
    borrowDecimals,
    vaultId,
    liquiditySupplyExchangePriceSlot,
    liquidityBorrowExchangePriceSlot,
    liquidityUserSupplySlot,
    liquidityUserBorrowSlot,
  } as Structs.ConstantViewsStruct;
};
