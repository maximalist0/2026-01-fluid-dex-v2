import chalk from "chalk";
import { HardhatRuntimeEnvironment, Libraries } from "hardhat/types";

import { isLocalNetwork, logWarning } from "./util";

export const verify = async (
  hre: HardhatRuntimeEnvironment,
  name: string,
  contractFullyQualifiedName: string,
  deployedAddress?: string,
  constructorArgs?: any[],
  libraries?: Libraries
) => {
  if (isLocalNetwork(hre.network.name)) {
    return;
  }

  if (!deployedAddress || !constructorArgs || !libraries) {
    // get deployment address, libraries and constructor args if not provided already
    const deployment = await hre.deployments.getOrNull(name);
    if (!!deployment) {
      deployedAddress = deployedAddress || deployment.address;
      constructorArgs = constructorArgs || deployment.args;
      libraries = libraries || deployment.libraries;
    }
  }

  // temporarily overwrite console log to remove compilation info etc. from log output written by verification plugin
  // and better align log output type (colors) with rest of logs. (does not swallow errors)
  const consoleLog = { ...console };
  console.log = (...text: unknown[]) => {
    if (text.join("").includes("has already been verified")) {
      if (name !== "EmptyImplementation" && name !== "EmptyImplementationUUPS") {
        consoleLog.log(chalk.gray(name + " has already been verified."));
      }
    } else if (text.join("").includes("failed contract verification")) {
      consoleLog.log(...text);
    } else if (text.join("").includes("Successfully verified contract")) {
      consoleLog.log(chalk.green(...text));
    } else if (text.join("").includes("does not have bytecode")) {
      consoleLog.log(
        chalk.gray("Block explorer API responded contract has no bytecode (yet). Waiting 3s and retry...")
      );
    } else if (text.join("").includes("too many tries")) {
      consoleLog.log("FAILED: Too many retries. Aborting verification. MUST FIX MANUALLY");
    }
  };
  console.info = () => {};
  console.debug = () => {};

  await tryVerify(hre, {
    address: deployedAddress!,
    contract: contractFullyQualifiedName,
    constructorArguments: constructorArgs!,
    libraries,
  });

  // reset console log
  console = { ...consoleLog };
};

const tryVerify = async (
  hre: HardhatRuntimeEnvironment,
  params: { address: string; contract: string; constructorArguments: any[]; libraries: Libraries | undefined },
  tryCount = 0
): Promise<any> => {
  if (tryCount > 40) {
    console.log("too many tries");
    return;
  }

  try {
    await hre.run("verify:verify", {
      ...params,
      // noCompile flag currently would just submit all files for verification, which makes code on block explorers
      // hard to investigate, see https://github.com/NomicFoundation/hardhat/issues/2472#issuecomment-1083281819.
      // source files, matching compiler settings and used libraries at same version currently used and compilation
      // triggered for verification.
      // noCompile: true,
    });
  } catch (error) {
    if (
      JSON.stringify((error as any)?._stack)?.includes("does not have bytecode") ||
      JSON.stringify((error as any)?._stack)?.includes("no bytecode") ||
      JSON.stringify((error as any)?._stack)?.includes("DeployedBytecodeNotFoundError")
    ) {
      // this log message is picked up and replaced in method console.log = (...text: unknown[]) => { above
      console.log("does not have bytecode");
      // wait until contract is available on block explorer -> 3s and retry
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return await tryVerify(hre, params, tryCount + 1);
    } else if (
      JSON.stringify((error as any)?._stack)?.includes("Reason: Already Verified") ||
      JSON.stringify((error as any)?._stack)?.includes("Contract source code already verified")
    ) {
      // this log message is picked up and replaced in method console.log = (...text: unknown[]) => { above
      console.log("has already been verified");
    } else {
      logWarning("failed contract verification:", error);
    }
  }
};
