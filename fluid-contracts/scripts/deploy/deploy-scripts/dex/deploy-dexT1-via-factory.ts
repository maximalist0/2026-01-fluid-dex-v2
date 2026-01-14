import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployment } from "hardhat-deploy/dist/types";

import fs from "fs";

import {
  FluidDexFactory,
  FluidDexFactory__factory,
  FluidDexT1DeploymentLogic,
  FluidDexT1DeploymentLogic__factory,
  FluidDexT1__factory,
} from "../../../../typechain-types";

import { FluidVersion } from "../../../settings";
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
import { Structs } from "../../../../typechain-types/contracts/protocols/dex/poolT1/coreModule/immutableVariables.sol/ImmutableVariables";

export const deployDexT1 = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  token0: string,
  token1: string,
  oracleMapping: number,
  addToDexIdCounter: number
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_1_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    token0,
    token1,
    oracleMapping,
    addToDexIdCounter
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string, number, number]
) => {
  const token0: string = throwIfAddressZero(args[0], "Dex token0");
  const token1: string = throwIfAddressZero(args[1], "Dex token1");
  const oracleMapping: number = args[2];
  const addToDexIdCounter: number = args[3];
  const deployer = await deployerSigner(hre);

  const dexFactory = FluidDexFactory__factory.connect((await hre.deployments.get("DexFactory")).address, deployer);
  const dexT1DeploymentLogic = FluidDexT1DeploymentLogic__factory.connect(
    (await hre.deployments.get("DexT1DeploymentLogic")).address,
    deployer
  );
  let dexId = (await dexFactory.totalDexes()).toNumber() + 1 + addToDexIdCounter;
  let deployedAddress = await dexFactory.getDexAddress(dexId);

  const name = await getDexContractName(hre, token0, token1);
  // must check current deployment like this, as `deployedAddress` differs based on new dexId
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
    dexId = (currentDeployment as any).args[0].dexId;
    deployedAddress = currentDeployment.address;
  }

  // build constructor args as passed in by factory for logs & verification on block explorer:
  const constructorArgs = await getConstructorArgs(
    hre,
    token0,
    token1,
    oracleMapping,
    dexId,
    deployedAddress,
    dexFactory,
    dexT1DeploymentLogic,
    currentDeployment
  );

  logDebug(
    "----------------------------------------- \nDeploying (creating tx data)",
    name,
    "for",
    version.replace(/_/g, ".") + ":"
  );

  const fullyQualifiedName = contractFullyQualifiedName(
    "FluidDexT1",
    "contracts/protocols/dex/poolT1/coreModule/core/main.sol"
  );

  if (!currentDeployment) {
    /// @notice                         Computes dexT1 bytecode
    const dexDeploymentData = (await dexT1DeploymentLogic.populateTransaction.dexT1(token0, token1, oracleMapping))
      .data as string;
    // deployDex Deploys a new dex using the specified deployment logic and data.
    // Only accounts with deployer access or the owner can deploy a new dex.
    const populatedTx = await dexFactory.populateTransaction.deployDex(
      dexT1DeploymentLogic.address, // @param dexDeploymentLogic_    The address of the dex deployment logic contract.
      dexDeploymentData //  @param dexDeploymentData_     The data to be used for dex deployment.
    );
    TxQueue.queue(
      populatedTx,
      JSON.stringify(FluidDexFactory__factory.abi),
      dexFactory.address,
      FluidDexFactory__factory.createInterface().getFunction("deployDex").format(),
      {
        dexDeploymentLogic_: dexT1DeploymentLogic.address,
        dexDeploymentData_: dexDeploymentData,
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

    logSuccess(`\nNewly deployed ${name} (via dexFactory) to: ${deployedAddress}.`);

    logDebug(`\nconstructorArgs for the deployment were: ${JSON.stringify(constructorArgs)}.\n`);
  } else {
    logDebug(
      `\nAlready had deployed ${name} to: ${deployedAddress}. MANUALLY COMPARE IF YOU REALLY WANT TO REPLACE THIS DEX DEPLOYMENT, IF SO, DELETE LOG FILES BEFORE RUNNING COMMAND AGAIN. See version log files for more.\n`
    );

    const txHash = currentDeployment.transactionHash;

    if (!txHash || txHash?.includes("TODO SET")) {
      throw new Error(
        "transaction hash in deployment file of the DEX missing. Set it in the log file in deployments folder, then run command again."
      );
    }

    const artifact = await hre.deployments.getArtifact(fullyQualifiedName);
    // save output log data to ./deployments/<network>/ folder. must be manually triggered because of custom deployment
    await hre.deployments.save(name, {
      abi: artifact.abi,
      address: deployedAddress,
      args: [constructorArgs],
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
      // receipt not available
      transactionHash: txHash,
    });

    // wite to log files, updating constructor args
    copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);

    // verify contract at block explorer of current network
    await verify(hre, name, fullyQualifiedName, deployedAddress);

    // verify all delegate called contracts
    const deployer = await deployerSigner(hre);
    const dexT1 = FluidDexT1__factory.connect(currentDeployment.address, deployer);
    const implementationsAddresses = (await dexT1.constantsView()).implementations;

    const operationsConstructorArgs = {
      ...constructorArgs,
      implementations: {
        shift: (await hre.deployments.get("DexT1Shift")).address,
        admin: hre.ethers.constants.AddressZero,
        colOperations: hre.ethers.constants.AddressZero,
        debtOperations: hre.ethers.constants.AddressZero,
        perfectOperationsAndSwapOut: hre.ethers.constants.AddressZero,
      },
    };

    // colOperations
    let fullyQualifiedNameOperations = contractFullyQualifiedName(
      "FluidDexT1OperationsCol",
      "contracts/protocols/dex/poolT1/coreModule/core/colOperations.sol"
    );
    await verifyImplementation(
      hre,
      version,
      implementationsAddresses.colOperations,
      `${name}_ColOperations`,
      fullyQualifiedNameOperations,
      [operationsConstructorArgs],
      txHash
    );

    // debtOperations
    fullyQualifiedNameOperations = contractFullyQualifiedName(
      "FluidDexT1OperationsDebt",
      "contracts/protocols/dex/poolT1/coreModule/core/debtOperations.sol"
    );
    await verifyImplementation(
      hre,
      version,
      implementationsAddresses.debtOperations,
      `${name}_DebtOperations`,
      fullyQualifiedNameOperations,
      [operationsConstructorArgs],
      txHash
    );

    // perfectOperations
    fullyQualifiedNameOperations = contractFullyQualifiedName(
      "FluidDexT1PerfectOperationsAndSwapOut",
      "contracts/protocols/dex/poolT1/coreModule/core/perfectOperationsAndSwapOut.sol"
    );
    await verifyImplementation(
      hre,
      version,
      implementationsAddresses.perfectOperationsAndSwapOut,
      `${name}_PerfectOperationsAndSwapOut`,
      fullyQualifiedNameOperations,
      [operationsConstructorArgs],
      txHash
    );
  }

  return deployedAddress;
};

export const getDexContractName = async (
  hre: HardhatRuntimeEnvironment,
  token0: string,
  token1: string
): Promise<string> => {
  const token0TokenSymbol = await getTokenSymbol(hre, token0);
  const token1TokenSymbol = await getTokenSymbol(hre, token1);

  // build dex deployment logs name
  return "Dex_" + token0TokenSymbol + "_" + token1TokenSymbol;
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
  token0: string,
  token1: string,
  oracleMapping: number,
  dexId: number,
  deployedAddress: string,
  dexFactory: FluidDexFactory,
  dexT1DeploymentLogic: FluidDexT1DeploymentLogic,
  currentDeployment: Deployment | null
): Promise<Structs.ConstantViewsStruct> => {
  const liquidityToken0ExchangePriceSlot = calculateMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_EXCHANGE_PRICES_MAPPING_SLOT,
    token0
  );
  const liquidityToken1ExchangePriceSlot = calculateMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_EXCHANGE_PRICES_MAPPING_SLOT,
    token1
  );

  const liquidityUserSupplySlotToken0 = calculateDoubleMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_USER_SUPPLY_DOUBLE_MAPPING_SLOT,
    deployedAddress,
    token0
  );
  const liquidityUserBorrowSlotToken0 = calculateDoubleMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_USER_BORROW_DOUBLE_MAPPING_SLOT,
    deployedAddress,
    token0
  );
  const liquidityUserSupplySlotToken1 = calculateDoubleMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_USER_SUPPLY_DOUBLE_MAPPING_SLOT,
    deployedAddress,
    token1
  );
  const liquidityUserBorrowSlotToken1 = calculateDoubleMappingStorageSlot(
    LiquiditySlotsLink.LIQUIDITY_USER_BORROW_DOUBLE_MAPPING_SLOT,
    deployedAddress,
    token1
  );

  // constructor input is this struct:
  // struct ConstantViews {
  //     uint256 dexId;
  //     address liquidity;
  //     address factory;
  //     Implementations implementations;
  //     address deployerContract;
  //     address token0;
  //     address token1;
  //     bytes32 supplyToken0Slot;
  //     bytes32 borrowToken0Slot;
  //     bytes32 supplyToken1Slot;
  //     bytes32 borrowToken1Slot;
  //     bytes32 exchangePriceToken0Slot;
  //     bytes32 exchangePriceToken1Slot;
  //     uint256 oracleMapping;
  // }

  //   struct Implementations {
  //     address shift;
  //     address admin;
  //     address colOperations;
  //     address debtOperations;
  //     address perfectOperationsAndSwapOut;
  // }

  // where for Implementations struct, unless it is for main.sol
  // all implementations should be zero other than shift.
  // for main.sol, no address is zero

  let implementations;

  if (currentDeployment) {
    const deployer = await deployerSigner(hre);
    const dexT1 = FluidDexT1__factory.connect(currentDeployment.address, deployer);
    const contractImplementations = (await dexT1.constantsView()).implementations;
    implementations = {
      shift: (await hre.deployments.get("DexT1Shift")).address,
      admin: contractImplementations.admin,
      colOperations: contractImplementations.colOperations,
      debtOperations: contractImplementations.debtOperations,
      perfectOperationsAndSwapOut: contractImplementations.perfectOperationsAndSwapOut,
    };
  } else {
    // just for logs before tx is executed
    implementations = {
      shift: (await hre.deployments.get("DexT1Shift")).address,
      admin: (await hre.deployments.get("DexT1Admin")).address,
      colOperations: "TODO_SET_AFTER_EXECUTION",
      debtOperations: "TODO_SET_AFTER_EXECUTION",
      perfectOperationsAndSwapOut: "TODO_SET_AFTER_EXECUTION",
    };
  }

  return {
    liquidity: await dexT1DeploymentLogic.LIQUIDITY(),
    factory: dexFactory.address,
    deployerContract: (await hre.deployments.get("DeployerFactory")).address,
    implementations,
    token0,
    token1,
    oracleMapping,
    dexId,
    supplyToken0Slot: liquidityUserSupplySlotToken0,
    borrowToken0Slot: liquidityUserBorrowSlotToken0,
    supplyToken1Slot: liquidityUserSupplySlotToken1,
    borrowToken1Slot: liquidityUserBorrowSlotToken1,
    exchangePriceToken0Slot: liquidityToken0ExchangePriceSlot,
    exchangePriceToken1Slot: liquidityToken1ExchangePriceSlot,
  } as Structs.ConstantViewsStruct;
};
