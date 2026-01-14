import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidSmartLendingFactory__factory } from "../../../../typechain-types";
import { FluidVersion } from "../../../settings";
import { deployerSigner, logSuccess, logDebug, verify, contractFullyQualifiedName, TxQueue } from "../../../util";
import { DeployFunction, executeDeployFunctionForVersion, copyLogFiles } from "../../util";

export const deploySmartLendingViaFactory = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  dexId: number
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, dexId);

  return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion, args: [number]) => {
  const dexId = args[0];

  const deployer = await deployerSigner(hre);

  const smartLendingFactory = FluidSmartLendingFactory__factory.connect(
    (await hre.deployments.get("SmartLendingFactory")).address,
    deployer
  );
  const liquidity = await smartLendingFactory.LIQUIDITY();
  const dexFactory = await smartLendingFactory.DEX_FACTORY();

  // constructor args as passed in by factory for logs & verification on block explorer
  // uint256 dexId_,
  // address liquidity_,
  // address dexFactory_,
  // address smartLendingFactory_
  const constructorArgs = [dexId, liquidity, dexFactory, smartLendingFactory.address];

  const contractName = "FluidSmartLending";

  const name = "SmartLending_fSL" + dexId;

  logDebug(
    "----------------------------------------- \nDeploying (creating tx data)",
    name,
    "for",
    version.replace(/_/g, ".") + ":"
  );

  const deployedAddress = await smartLendingFactory.getSmartLendingAddress(dexId);

  const currentValue = await hre.ethers.provider.getCode(deployedAddress);

  if (currentValue === "" || currentValue === "0x") {
    const populatedTx = await smartLendingFactory.populateTransaction.deploy(dexId);
    TxQueue.queue(
      populatedTx,
      JSON.stringify(FluidSmartLendingFactory__factory.abi),
      smartLendingFactory.address,
      FluidSmartLendingFactory__factory.createInterface().getFunction("deploy").format(),
      {
        dexId_: dexId,
      }
    );

    const artifact = await hre.deployments.getArtifact(contractName);
    // save output log data to ./deployments/<network>/ folder. must be manually triggered because of custom deployment
    await hre.deployments.save(name, {
      abi: artifact.abi,
      address: deployedAddress,
      args: constructorArgs,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
      // receipt not available
      transactionHash: "TODO_SET_AFTER_EXECUTION", // must be set manually in Log files after execution
    });

    // wite to log files if contract is newly deployed
    copyLogFiles(hre.network.name, name, version, deployedAddress, constructorArgs);

    logSuccess(`\nQueued new deployment of ${name} (via SmartLendingFactory), address available during deployment.`);

    logDebug(`\nconstructorArgs for the deployment were: ${JSON.stringify(constructorArgs)}.\n`);
  } else {
    logDebug(`\nAlready had deployed ${name} to: ${deployedAddress}. See version log files for more.\n`);

    const contractFullPathName = contractFullyQualifiedName(
      contractName,
      `contracts/protocols/dex/smartLending/main.sol`
    );

    // wite to log files, updating deployed address
    copyLogFiles(hre.network.name, name, version, deployedAddress, [constructorArgs]);

    // verify contract at block explorer of current network
    await verify(hre, name, contractFullPathName, deployedAddress);
  }

  return deployedAddress;
};
