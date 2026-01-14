import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Deployment } from "hardhat-deploy/dist/types";

import {
  FluidVaultFactory,
  FluidVaultFactory__factory,
  FluidVaultT1DeploymentLogic__factory,
  FluidVaultT2DeploymentLogic__factory,
  FluidVaultT3DeploymentLogic__factory,
  FluidVaultT4DeploymentLogic__factory,
  IFluidVault__factory,
} from "../../../../../typechain-types";
import { Structs } from "../../../../../typechain-types/contracts/protocols/vault/vaultTypesCommon/coreModule/main.sol/FluidVault";

import {
  FluidVersion,
  getVaultTypeName,
  getVaultTypePath,
  isVaultTypeSmartCol,
  isVaultTypeSmartDebt,
  VAULT_TYPE,
} from "../../../../settings";
import {
  calculateDoubleMappingStorageSlot,
  calculateMappingStorageSlot,
  deployerSigner,
  DexSlotsLink,
  getTokenSymbol,
  LiquiditySlotsLink,
  logDebug,
  logSuccess,
  throwIfAddressZero,
  TxQueue,
  verify,
} from "../../../../util";
import { copyLogFiles, DeployFunction, executeDeployFunctionForVersion } from "../../../util";

export const deployVaultT234 = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  supplyToken: string, // set to dex address for smart col
  borrowToken: string, // set to dex address for smart debt
  addToVaultIdCounter: number,
  vaultType: VAULT_TYPE
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    supplyToken,
    borrowToken,
    addToVaultIdCounter,
    vaultType
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, number, VAULT_TYPE]
) => {
  const supplyToken: string = throwIfAddressZero(args[0], "Vault supply token");
  const borrowToken: string = throwIfAddressZero(args[1], "Vault borrow token");
  const addToVaultIdCounter: number = args[2];
  const vaultType: VAULT_TYPE = args[3];

  const deployer = await deployerSigner(hre);

  const vaultFactory = FluidVaultFactory__factory.connect(
    (await hre.deployments.get("VaultFactory")).address,
    deployer
  );

  let vaultId = (await vaultFactory.totalVaults()).toNumber() + 1 + addToVaultIdCounter;
  let deployedAddress = await vaultFactory.getVaultAddress(vaultId);

  const name = await getVaultContractName(hre, supplyToken, borrowToken, vaultType);
  // must check current deployment like this, as `deployedAddress` differs based on new vaultId
  let currentDeployment = await hre.deployments.getOrNull(name);
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
    vaultType,
    currentDeployment
  );

  logDebug("constructorArgs:", JSON.stringify(constructorArgs));

  logDebug(
    "----------------------------------------- \nDeploying (creating tx data)",
    name,
    "for",
    version.replace(/_/g, ".") + ":"
  );

  const contractName = `${getVaultTypeName(vaultType)}`;
  const fullyQualifiedName = `${getVaultTypePath(vaultType)}coreModule/main.sol:Fluid${contractName}`;

  if (!currentDeployment) {
    const deployTx = await getVaultTypeDeploymentLogicTx(hre, deployer, vaultType, supplyToken, borrowToken);

    // deployVault Deploys a new vault using the specified deployment logic and data.
    // Only accounts with deployer access or the owner can deploy a new vault.
    const populatedTx = await vaultFactory.populateTransaction.deployVault(
      deployTx.deploymentLogicAddress, // @param vaultDeploymentLogic_    The address of the vault deployment logic contract.
      deployTx.deploymentData //  @param vaultDeploymentData_     The data to be used for vault deployment.
    );
    TxQueue.queue(
      populatedTx,
      JSON.stringify(FluidVaultFactory__factory.abi),
      vaultFactory.address,
      FluidVaultFactory__factory.createInterface().getFunction("deployVault").format(),
      {
        vaultDeploymentLogic_: deployTx.deploymentLogicAddress,
        vaultDeploymentData_: deployTx.deploymentData,
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

    const txHash = currentDeployment.transactionHash;

    if (!txHash || txHash?.includes("TODO SET")) {
      throw new Error(
        "transaction hash in deployment file of the Vault missing. Set it in the log file in deployments folder, then run command again."
      );
    }

    // wite to log files, updating constructor args
    copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);

    // verify contract at block explorer of current network
    await verify(hre, name, fullyQualifiedName, deployedAddress, [constructorArgs]);

    // verify all delegate called contracts (mainOperate). VaultSecondary and VaultAdmin are already verified
    const deployer = await deployerSigner(hre);
    const vault = IFluidVault__factory.connect(currentDeployment.address, deployer);
    const vaultConstants = await vault.constantsView();

    const operateConstructorArgs = {
      ...constructorArgs,
      operateImplementation: ethers.constants.AddressZero,
    };

    let fullyQualifiedNameOperate = `${getVaultTypePath(
      vaultType
    )}coreModule/mainOperate.sol:Fluid${contractName}Operate`;

    await verifyImplementation(
      hre,
      version,
      vaultConstants.operateImplementation,
      `${name}_Operate`,
      fullyQualifiedNameOperate,
      [operateConstructorArgs],
      txHash
    );
  }

  return deployedAddress;
};

export const getVaultContractName = async (
  hre: HardhatRuntimeEnvironment,
  supplyToken: string,
  borrowToken: string,
  vaultType: VAULT_TYPE
): Promise<string> => {
  const supplyTokenSymbol = await getTokenSymbol(hre, supplyToken);
  const borrowTokenSymbol = await getTokenSymbol(hre, borrowToken);

  // build vault deployment logs name
  return `${getVaultTypeName(vaultType)}_` + supplyTokenSymbol + "_" + borrowTokenSymbol; // + "_CONCENTRATED";
};

const verifyImplementation = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  implAddress: string,
  name: string,
  fullyQualifiedName: string,
  constructorArgs: any,
  txHash: string
) => {
  const artifact = await hre.deployments.getArtifact(fullyQualifiedName);

  await verify(hre, name, fullyQualifiedName, implAddress, constructorArgs);

  // save output log data to ./deployments/<network>/ folder. must be manually triggered because of custom deployment
  await hre.deployments.save(name, {
    abi: artifact.abi,
    address: implAddress,
    args: constructorArgs,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
    // receipt not available
    transactionHash: txHash,
  });
  // wite to log files if contract is newly deployed
  copyLogFiles(hre.network.name, name, version, implAddress, [constructorArgs]);
};

const getConstructorArgs = async (
  hre: HardhatRuntimeEnvironment,
  supplyToken: string,
  borrowToken: string,
  vaultId: number,
  deployedAddress: string,
  vaultFactory: FluidVaultFactory,
  vaultType: VAULT_TYPE,
  currentDeployment: Deployment | null
): Promise<Structs.ConstantViewsStruct> => {
  const liquidity = (await hre.deployments.get("Liquidity")).address;

  let supplyTokenStruct: Structs.TokensStruct = {
    token0: ethers.constants.AddressZero,
    token1: ethers.constants.AddressZero,
  };
  let supply = liquidity;
  let userSupplySlot = ethers.constants.HashZero;
  let supplyExchangePriceSlot = ethers.constants.HashZero;
  if (isVaultTypeSmartCol(vaultType)) {
    supply = supplyToken;

    const dexDeployment = (await hre.deployments.getDeploymentsFromAddress(supply))[0];
    supplyTokenStruct.token0 = dexDeployment.args![0].token0;
    supplyTokenStruct.token1 = dexDeployment.args![0].token1;

    userSupplySlot = calculateMappingStorageSlot(DexSlotsLink.DEX_USER_SUPPLY_MAPPING_SLOT, deployedAddress);
  } else {
    supplyTokenStruct.token0 = supplyToken;

    userSupplySlot = calculateDoubleMappingStorageSlot(
      LiquiditySlotsLink.LIQUIDITY_USER_SUPPLY_DOUBLE_MAPPING_SLOT,
      deployedAddress,
      supplyToken
    );

    supplyExchangePriceSlot = calculateMappingStorageSlot(
      LiquiditySlotsLink.LIQUIDITY_EXCHANGE_PRICES_MAPPING_SLOT,
      supplyToken
    );
  }

  let borrowTokenStruct: Structs.TokensStruct = {
    token0: ethers.constants.AddressZero,
    token1: ethers.constants.AddressZero,
  };
  let borrow = liquidity;
  let userBorrowSlot = ethers.constants.HashZero;
  let borrowExchangePriceSlot = ethers.constants.HashZero;
  if (isVaultTypeSmartDebt(vaultType)) {
    borrow = borrowToken;

    const dexDeployment = (await hre.deployments.getDeploymentsFromAddress(borrow))[0];
    borrowTokenStruct.token0 = dexDeployment.args![0].token0;
    borrowTokenStruct.token1 = dexDeployment.args![0].token1;

    userBorrowSlot = calculateMappingStorageSlot(DexSlotsLink.DEX_USER_BORROW_MAPPING_SLOT, deployedAddress);
  } else {
    borrowTokenStruct.token0 = borrowToken;

    userBorrowSlot = calculateDoubleMappingStorageSlot(
      LiquiditySlotsLink.LIQUIDITY_USER_BORROW_DOUBLE_MAPPING_SLOT,
      deployedAddress,
      borrowToken
    );

    borrowExchangePriceSlot = calculateMappingStorageSlot(
      LiquiditySlotsLink.LIQUIDITY_EXCHANGE_PRICES_MAPPING_SLOT,
      borrowToken
    );
  }

  const deployer = await deployerSigner(hre);

  // constructor args is ConstantsView struct:
  // liquidity: PromiseOrValue<string>;
  // factory: PromiseOrValue<string>;
  // operateImplementation: PromiseOrValue<string>;
  // adminImplementation: PromiseOrValue<string>;
  // secondaryImplementation: PromiseOrValue<string>;
  // deployer: PromiseOrValue<string>;
  // supply: PromiseOrValue<string>;
  // borrow: PromiseOrValue<string>;
  // supplyToken: Structs.TokensStruct;
  // borrowToken: Structs.TokensStruct;
  // vaultId: PromiseOrValue<BigNumberish>;
  // vaultType: PromiseOrValue<BigNumberish>;
  // supplyExchangePriceSlot: PromiseOrValue<BytesLike>;
  // borrowExchangePriceSlot: PromiseOrValue<BytesLike>;
  // userSupplySlot: PromiseOrValue<BytesLike>;
  // userBorrowSlot: PromiseOrValue<BytesLike>;

  let operateImplementation = "TODO_SET_AFTER_EXECUTION";
  if (currentDeployment) {
    const vault = IFluidVault__factory.connect(currentDeployment.address, deployer);
    const vaultConstants = await vault.constantsView();
    operateImplementation = vaultConstants.operateImplementation;
  }

  return {
    liquidity,
    factory: vaultFactory.address,
    operateImplementation,
    adminImplementation: (await hre.deployments.get(`${getVaultTypeName(vaultType)}Admin`)).address,
    secondaryImplementation: (await hre.deployments.get("VaultSecondary")).address,
    deployer: (await hre.deployments.get("DeployerFactory")).address,
    supply,
    borrow,
    supplyToken: supplyTokenStruct,
    borrowToken: borrowTokenStruct,
    vaultId,
    vaultType: vaultType.toString(),
    supplyExchangePriceSlot,
    borrowExchangePriceSlot,
    userSupplySlot,
    userBorrowSlot,
  } as Structs.ConstantViewsStruct;
};

const getVaultTypeDeploymentLogicTx = async (
  hre: HardhatRuntimeEnvironment,
  deployer: SignerWithAddress,
  vaultType: VAULT_TYPE,
  supplyToken: string,
  borrowToken: string
): Promise<{ deploymentLogicAddress: string; deploymentData: string }> => {
  if (vaultType === VAULT_TYPE.T1) {
    const deploymentLogic = FluidVaultT1DeploymentLogic__factory.connect(
      (await hre.deployments.get(`${getVaultTypeName(vaultType)}DeploymentLogic`)).address,
      deployer
    );

    /// @notice                         Computes vaultT1 bytecode for the given supply token (`supplyToken_`), borrow token (`borrowToken_`), and admin implementation (`adminImplementation_`).
    ///                                 This will be called by the VaultFactory via .delegateCall
    /// @param supplyToken_             The address of the supply token.
    /// @param borrowToken_             The address of the borrow token.
    /// @return vaultCreationBytecode_  Returns the bytecode of the newly vault to deploy.
    const vaultDeploymentData = (await deploymentLogic.populateTransaction.vaultT1(supplyToken, borrowToken))
      .data as string;

    return { deploymentLogicAddress: deploymentLogic.address, deploymentData: vaultDeploymentData };
  }
  if (vaultType === VAULT_TYPE.T2_SMART_COL) {
    const deploymentLogic = FluidVaultT2DeploymentLogic__factory.connect(
      (await hre.deployments.get(`${getVaultTypeName(vaultType)}DeploymentLogic`)).address,
      deployer
    );

    /// @notice                         Computes vaultT2 bytecode
    ///                                 This will be called by the VaultFactory via .delegateCall
    /// @param supplyToken_             The address of the supply token (smart col).
    /// @param borrowToken_             The address of the borrow token.
    /// @return vaultCreationBytecode_  Returns the bytecode of the newly vault to deploy.
    const vaultDeploymentData = (await deploymentLogic.populateTransaction.vaultT2(supplyToken, borrowToken))
      .data as string;

    return { deploymentLogicAddress: deploymentLogic.address, deploymentData: vaultDeploymentData };
  }
  if (vaultType === VAULT_TYPE.T3_SMART_DEBT) {
    const deploymentLogic = FluidVaultT3DeploymentLogic__factory.connect(
      (await hre.deployments.get(`${getVaultTypeName(vaultType)}DeploymentLogic`)).address,
      deployer
    );

    /// @notice                         Computes vaultT3 bytecode
    ///                                 This will be called by the VaultFactory via .delegateCall
    /// @param supplyToken_             The address of the supply token.
    /// @param borrowToken_             The address of the borrow token (smart debt).
    /// @return vaultCreationBytecode_  Returns the bytecode of the newly vault to deploy.
    const vaultDeploymentData = (await deploymentLogic.populateTransaction.vaultT3(supplyToken, borrowToken))
      .data as string;

    return { deploymentLogicAddress: deploymentLogic.address, deploymentData: vaultDeploymentData };
  }
  if (vaultType === VAULT_TYPE.T4_SMART_COL_SMART_DEBT) {
    const deploymentLogic = FluidVaultT4DeploymentLogic__factory.connect(
      (await hre.deployments.get(`${getVaultTypeName(vaultType)}DeploymentLogic`)).address,
      deployer
    );

    /// @notice                         Computes vaultT4 bytecode
    ///                                 This will be called by the VaultFactory via .delegateCall
    /// @param supplyToken_             The address of the supply token (smart col).
    /// @param borrowToken_             The address of the borrow token (smart debt).
    /// @return vaultCreationBytecode_  Returns the bytecode of the newly vault to deploy.
    const vaultDeploymentData = (await deploymentLogic.populateTransaction.vaultT4(supplyToken, borrowToken))
      .data as string;

    return { deploymentLogicAddress: deploymentLogic.address, deploymentData: vaultDeploymentData };
  }

  throw new Error("Vault Type not exist");
};
