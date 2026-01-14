import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import path from "path";

import { deployerAddress, deployerSigner, isLocalNetwork, logDebug, logError, logSuccess, verify } from "../../util";
import { buildExplorerLink, deploymentsConfig, FluidVersion } from "../../settings";
import { BigNumber } from "ethers";
import { DeployResult } from "hardhat-deploy/dist/types";
import { FluidContractFactory__factory } from "../../../typechain-types";

export type DeployFunction = (hre: HardhatRuntimeEnvironment, version: FluidVersion, ...args: any[]) => Promise<string>;

export const executeDeployFunctionForVersion = (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  deployFunctions: Map<FluidVersion, DeployFunction>,
  ...args: any[]
) => {
  if (!deployFunctions.has(version)) {
    throw new Error(`${version} is not available for this command / contract!`);
  }

  return deployFunctions.get(version)!(hre, version, args);
};

export const deploy = async (
  hre: HardhatRuntimeEnvironment,
  name: string,
  // contract fully qualified name: path in artifacts folder + name, e.g. liquidity proxy is in "contracts/liquidity/proxy.sol:Liquidity"
  fullyQualifiedName: string,
  version: FluidVersion,
  constructorArgs: any[],
  from?: string,
  throughDeployerFactory = false
): Promise<string> => {
  if (!from) {
    const deployer = await deployerAddress(hre);
    from = deployer;
  }

  if (name !== "EmptyImplementation" && name !== "EmptyImplementationUUPS") {
    logDebug("----------------------------------------- \nDeploying", name, "for", version.replace(/_/g, ".") + ":");
  }

  const deployment = await tryDeployWithMaxGas(
    hre,
    name,
    fullyQualifiedName,
    from,
    constructorArgs,
    hre.ethers.BigNumber.from(deploymentsConfig.maxFeePerGas),
    undefined,
    undefined,
    throughDeployerFactory
  );
  const deployedAddress = deployment.address;

  if (deployment.newlyDeployed) {
    logDebug("Deployment gas used", deployment.receipt?.gasUsed.toString());
    const code = await (await deployerSigner(hre)).provider?.getCode(deployment.address);
    const size = (code!.length - 2) / 2 / 1024; // in KB
    logDebug("Contract deployed bytecode size in KB:", size);

    // todo log must include nonce deployer factory...?

    // wite to log files if contract is newly deployed
    copyLogFiles(
      hre.network.name,
      name,
      version,
      deployedAddress,
      constructorArgs,
      undefined,
      deployment.linkedData?.nonce
    );

    logSuccess(`\nNewly deployed ${name} to: ${deployedAddress}`);
    logDebug(
      `Deployer Address: ${from}.\nconstructorArgs for the deployment were: ${JSON.stringify(
        constructorArgs
      )}.\ntx hash: ${deployment.transactionHash}\n`
    );
  } else {
    if (name !== "EmptyImplementation" && name !== "EmptyImplementationUUPS") {
      logDebug(`\nAlready had deployed ${name} to: ${deployedAddress}. See version log files for more.\n`);
    }
  }

  // verify contract at block explorer of current network
  await verify(hre, name, fullyQualifiedName, deployedAddress, constructorArgs, deployment.libraries);

  return deployedAddress;
};

export const copyLogFiles = (
  network: string,
  name: string,
  version: FluidVersion,
  deployedAddress: string,
  constructorArgs: any[],
  create3Salt?: string,
  nonce?: string
) => {
  const deploymentsNetworkPath = `deployments/${network}/`;

  // copy log file to deployments/network/dump/{deployedAddress}
  copyFile(`${deploymentsNetworkPath}${name}.json`, `${deploymentsNetworkPath}dump/${deployedAddress}.json`);

  // copy log file to deployments/network/{version}/{name}
  copyFile(`${deploymentsNetworkPath}${name}.json`, `${deploymentsNetworkPath}${version}/${name}.json`);

  // update versions file in deployments/{version}.md
  updateVersionsFile(network, name, version, deployedAddress, constructorArgs, create3Salt, nonce);
};

export const copyFile = (from: string, to: string) => {
  // create directory if it does not exist yet
  const folderPath = path.dirname(to);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // copy file
  fs.copyFile(from, to, (err: any) => {
    if (err) {
      logError(`Log file could not be correctly copied. FIX THIS MANUALLY: Copy file ${from} to ${to}`);

      console.log(`(Error): ${err}`);
    }
  });
};

export const updateVersionsFile = (
  network: string,
  contractName: string,
  version: FluidVersion,
  deployedAddress: string,
  constructorArgs: any[],
  create3Salt?: string,
  nonce?: string
) => {
  // @dev comment out for local testing
  if (isLocalNetwork(network)) {
    return;
  }

  const versionsFilePath = `deployments/deployments.md`;
  let versionsFile = "";
  try {
    // read current versions file data if it exists
    if (fs.existsSync(versionsFilePath)) {
      versionsFile = fs.readFileSync(versionsFilePath, "utf8");
    } else {
      versionsFile = `# Fluid contract deployments\n\n`;
    }
  } catch (err) {
    logError(`reading versions file: ${err}`);
  }

  const contractHeading = `### ${contractName} `;
  if (!versionsFile.includes(contractHeading)) {
    // look in versions.md file if heading with contractName already exists, if not that means this contract has just
    // been deployed the first time on any network -> create heading
    versionsFile = versionsFile.concat(`${contractHeading}\n`);
  }

  // upsert: insert or update contract data in the deployed addresses table for this version -> contract -> network
  const onlyTextAfterHeading = versionsFile.split(contractHeading)[1];
  const onlyCurrentContractData = onlyTextAfterHeading.split("###")[0];

  let newCurrentContractData = onlyCurrentContractData.trim();
  if (newCurrentContractData.includes("##")) {
    newCurrentContractData = newCurrentContractData.split("##")[0]?.trim();
  }

  const tableHeaderRegex = /\|\s*Network\s*\|\s*Address\s*\|\s*Explorer\s*\|\s*Constructor\s*Args\s*\|\s*Salt\s*\|/;

  // Check if the table exists
  if (!onlyCurrentContractData.match(tableHeaderRegex)) {
    // Add table header if it doesn't exist
    newCurrentContractData += "| Network | Address | Explorer | Constructor Args | Salt |\n|---|---|---|---|---|";
  }

  // Prepare the table row with the new data
  const newRow = createMDTableRow(network, deployedAddress, constructorArgs, create3Salt, nonce);

  // Check if a row for the given network already exists
  const networkRowRegex = new RegExp(`\\|\\s*${network}\\s*\\|[^|]*\\|[^|]*\\|[^|]*\\|[^|]*\\|`);

  // Replace the existing data with newRow if a matching row is found
  if (newCurrentContractData.match(networkRowRegex)) {
    newCurrentContractData = newCurrentContractData.replace(networkRowRegex, newRow);
  } else {
    // If no matching row is found, insert the newRow
    newCurrentContractData += "\n" + newRow;
  }

  versionsFile = versionsFile.replace(
    contractHeading + onlyCurrentContractData,
    contractHeading + "\n\n" + newCurrentContractData + "\n\n"
  );

  // write new md file data
  try {
    fs.writeFileSync(versionsFilePath, versionsFile);
  } catch (err) {
    logError(`writing versions file: ${err}`);
  }
};

// Function to format the table rows and header in markdown format
const createMDTableRow = (
  network: string,
  address: string,
  constructorArgs: any[],
  create3Salt?: string,
  nonce?: string
) => {
  let salts = deploymentsConfig.deterministicDeploymentSalt;
  if (create3Salt) {
    salts += ` (CREATE3 salt: ${create3Salt})`;
  }
  if (nonce) {
    salts += ` (DeployerFactory nonce: ${nonce})`;
  }

  const constructorArgsString = constructorArgs.map((arg) => JSON.stringify(arg)).join(", ");

  return `| ${network} | ${address} | ${buildExplorerLink(network, address)} | ${constructorArgsString} | ${salts} |`;
};

const tryDeployWithMaxGas = async (
  hre: HardhatRuntimeEnvironment,
  name: string,
  fullyQualifiedName: string,
  from: string,
  constructorArgs: any[],
  maxFeePerGas: BigNumber,
  maxTries = 10000,
  tryCount = 0,
  throughDeployerFactory = false
): Promise<DeployResult> => {
  let deployment;
  if (throughDeployerFactory) {
    // must check current deployment like this, as `deployedAddress` differs based on new dexId
    let currentDeployment = await hre.deployments.getOrNull(name);
    if (currentDeployment) {
      // verify contract at block explorer of current network
      await verify(hre, name, fullyQualifiedName, currentDeployment.address, constructorArgs);

      throw new Error(
        `Trying to deploy via DeployerFactory but deployment for ${name} already exists in the logs. Fix manually.`
      );
    }

    let artifact = await hre.deployments.getArtifact(fullyQualifiedName);

    // todo implement support for maxFeePerGas

    const { contractAddress, nonce, txHash } = await deployViaDeployerFactory(
      hre,
      from,
      artifact.bytecode,
      artifact.abi,
      constructorArgs
    );

    deployment = {
      abi: artifact.abi,
      address: contractAddress,
      args: [constructorArgs],
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
      // receipt not available
      transactionHash: txHash,
      linkedData: {
        nonce,
      },
    };

    await hre.deployments.save(name, deployment);

    deployment = {
      ...deployment,
      newlyDeployed: true,
    } as any;
  } else {
    try {
      if (maxFeePerGas.isZero()) {
        deployment = await hre.deployments.deploy(name, {
          contract: fullyQualifiedName,
          from,
          args: constructorArgs,
          log: true,
          deterministicDeployment: deploymentsConfig.deterministicDeploymentSalt,
          waitConfirmations: deploymentsConfig.waitConfirmations(hre.network.name),
        });
      } else {
        deployment = await hre.deployments.deploy(name, {
          contract: fullyQualifiedName,
          from,
          args: constructorArgs,
          log: true,
          deterministicDeployment: deploymentsConfig.deterministicDeploymentSalt,
          waitConfirmations: deploymentsConfig.waitConfirmations(hre.network.name),
          // @dev in some cases, e.g. Polygon zkEVM, deployment might fail with a ProviderError. This is likely due to
          // issues with gas estimation for the deployment tx. Try to set gas limits manually in that case, uncomment:
          // estimatedGasLimit: 29_000_000,
          // gasLimit: 29_000_000,
          maxFeePerGas, // set this to limit the max allowed gas fee (gas + priority)
        });
      }
    } catch (ex: any) {
      if (
        ex.toString().includes("max fee per gas less than block base fee") ||
        ex.toString().includes("fee cap less than block base fee") ||
        ex.toString().includes("is less than the block's baseFeePerGas")
      ) {
        if (tryCount < maxTries) {
          console.log("max fee was too small, trying again....");
          logDebug(ex);

          // wait some time
          await new Promise((resolve) => setTimeout(resolve, 8000));

          return tryDeployWithMaxGas(
            hre,
            name,
            fullyQualifiedName,
            from,
            constructorArgs,
            maxFeePerGas,
            maxTries,
            tryCount + 1
          );
        } else {
          console.log("max tries reached, stopping.");
        }
      }
      throw ex;
    }
  }

  return deployment;
};

export const deployViaDeployerFactory = async (
  hre: HardhatRuntimeEnvironment,
  from: string,
  bytecode: string,
  abi: any,
  constructorArgs: any
): Promise<{ contractAddress: string; nonce: string; txHash: string }> => {
  const deployer = await hre.ethers.getSigner(from);

  const iface = new ethers.utils.Interface(abi);
  const encodedArgs = iface.encodeDeploy(constructorArgs).slice(2);
  const finalBytecode = `${bytecode}${encodedArgs}`;

  const deployerFactory = FluidContractFactory__factory.connect(
    (await hre.deployments.get("DeployerFactory")).address,
    deployer
  );

  let res = await (
    await deployerFactory.deployContract(finalBytecode)
  ).wait(deploymentsConfig.waitConfirmations(hre.network.name));

  let event = (res?.events as any as Event[])[0];
  const deployment = {
    contractAddress: (event as any).args[0] as string,
    nonce: (event as any).args[1]?.toString() as string,
    txHash: res.transactionHash,
  };

  logDebug(`\nDeployed via DeployerFactory nonce ${deployment.nonce} to: ${deployment.contractAddress}`);

  return deployment;
};
