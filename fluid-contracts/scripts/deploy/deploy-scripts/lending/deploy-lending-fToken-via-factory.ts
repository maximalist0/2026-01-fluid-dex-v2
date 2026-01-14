import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidLendingFactory__factory } from "../../../../typechain-types";
import { FluidVersion } from "../../../settings";
import {
  deployerSigner,
  logSuccess,
  logDebug,
  verify,
  contractFullyQualifiedName,
  throwIfAddressZero,
  TxQueue,
  getTokenSymbol,
} from "../../../util";
import { DeployFunction, executeDeployFunctionForVersion, copyLogFiles } from "../../util";

export enum FTokenType {
  // Unset = 0, // 0
  fToken = 1, // 1
  NativeUnderlying = 2, // 2
}

export const deployLendingFToken = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  underlyingAsset: string,
  fTokenType: FTokenType
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    underlyingAsset,
    fTokenType
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, FTokenType]
) => {
  const underlyingAsset: string = throwIfAddressZero(args[0], "fToken underlying");
  const fTokenType: FTokenType = args[1];

  const deployer = await deployerSigner(hre);

  const lendingFactory = FluidLendingFactory__factory.connect(
    (await hre.deployments.get("LendingFactory")).address,
    deployer
  );
  const liquidity = await lendingFactory.LIQUIDITY();

  // constructor args as passed in by factory for logs & verification on block explorer
  const constructorArgs = [liquidity, lendingFactory.address, underlyingAsset];

  const contractName = fTokenType === FTokenType.fToken ? "fToken" : "fTokenNativeUnderlying";

  const name = "fToken_f" + (await getTokenSymbol(hre, underlyingAsset));

  logDebug(
    "----------------------------------------- \nDeploying (creating tx data)",
    name,
    "for",
    version.replace(/_/g, ".") + ":"
  );

  const fTokenTypeString = contractName === "fToken" ? contractName : contractName.replace("fToken", "");

  const deployedAddress = await lendingFactory.computeToken(underlyingAsset, fTokenTypeString);

  const currentValue = await hre.ethers.provider.getCode(deployedAddress);

  if (currentValue === "" || currentValue === "0x") {
    const populatedTx = await lendingFactory.populateTransaction.createToken(
      underlyingAsset,
      fTokenTypeString, // fTokenType: fToken = 1, NativeUnderlying = 2
      contractName === "fTokenNativeUnderlying" // isNativeUnderlying flag
    );
    TxQueue.queue(
      populatedTx,
      JSON.stringify(FluidLendingFactory__factory.abi),
      lendingFactory.address,
      FluidLendingFactory__factory.createInterface().getFunction("createToken").format(),
      {
        asset_: underlyingAsset,
        fTokenType_: fTokenTypeString,
        isNativeUnderlying_: contractName === "fTokenNativeUnderlying",
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

    logSuccess(`\nQueued new deployment of ${name} (via LendingFactory) to: ${deployedAddress}.`);

    logDebug(`\nconstructorArgs for the deployment were: ${JSON.stringify(constructorArgs)}.\n`);
  } else {
    logDebug(`\nAlready had deployed ${name} to: ${deployedAddress}. See version log files for more.\n`);

    const contractFullPathName =
      fTokenType === FTokenType.fToken
        ? contractFullyQualifiedName(contractName, `contracts/protocols/lending/fToken/main.sol`)
        : contractFullyQualifiedName(
            contractName,
            `contracts/protocols/lending/fToken/nativeUnderlying/${contractName}.sol`
          );

    // verify contract at block explorer of current network
    await verify(hre, name, contractFullPathName, deployedAddress);
  }

  return deployedAddress;
};
