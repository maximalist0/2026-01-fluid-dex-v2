import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";

import { SStore2Deployer__factory } from "../../../../typechain-types";
import { deployerSigner, logDebug, logSuccess } from "../../../util";

// A list of already deployed bytecodes via SSTORE is maintained in deployments/network
// If it already exists, deployment is skipped

export const deployViaSStore2 = async (hre: HardhatRuntimeEnvironment, bytecode: string): Promise<string> => {
  const network = hre.network.name;
  const pointersFilePath = `deployments/${network}/sstore2Pointers.json`;
  const { existingPointer, pointersData } = checkSSTORE2Exists(pointersFilePath, bytecode);

  if (!!existingPointer) {
    logDebug("Skipped SSTORE2 deployment because pointer with same bytecode already exists");
    return existingPointer.pointer;
  }

  const deployer = await deployerSigner(hre);
  const sstore2Deployer = SStore2Deployer__factory.connect(
    (await hre.deployments.get("SStore2Deployer")).address,
    deployer
  );

  let res = await sstore2Deployer.deployCode(bytecode);
  let event = ((await res.wait())?.events as any as Event[])[0];
  const pointer = (event as any).args[0] as string;

  appendSSTORE2Pointer(pointersFilePath, bytecode, pointersData, pointer, network);

  return pointer;
};

export const deployViaSStore2CodeSplit = async (
  hre: HardhatRuntimeEnvironment,
  bytecode: string
): Promise<{ pointer1: string; pointer2: string }> => {
  const network = hre.network.name;
  const pointersFilePath = `deployments/${network}/sstore2Pointers.json`;
  const { existingPointer, pointersData } = checkSSTORE2Exists(pointersFilePath, bytecode);

  if (!!existingPointer) {
    logDebug("Skipped SSTORE2 deployment because pointer with same bytecode already exists");
    return { pointer1: existingPointer.pointer, pointer2: existingPointer.pointer2! };
  }

  const deployer = await deployerSigner(hre);

  const sstore2Deployer = SStore2Deployer__factory.connect(
    (await hre.deployments.get("SStore2Deployer")).address,
    deployer
  );

  let res = await sstore2Deployer.deployCodeSplit(bytecode);

  let event = ((await res.wait())?.events as any as Event[])[0];
  const pointer1 = (event as any).args[0] as string;
  const pointer2 = (event as any).args[1] as string;

  appendSSTORE2Pointer(pointersFilePath, bytecode, pointersData, pointer1, network, pointer2);

  return { pointer1, pointer2 };
};

const checkSSTORE2Exists = (pointersFilePath: string, bytecode: string) => {
  let pointersData: { pointer: string; pointer2?: string; bytecodeHash: string }[] = [];

  // Read existing pointers data if the file exists
  if (fs.existsSync(pointersFilePath)) {
    pointersData = JSON.parse(fs.readFileSync(pointersFilePath, "utf8"));
  }

  const bytecodeHash = ethers.utils.keccak256(bytecode);
  const existingPointer = pointersData.find((data) => data.bytecodeHash === bytecodeHash);

  return {
    existingPointer,
    pointersData,
  };
};

const appendSSTORE2Pointer = (
  pointersFilePath: string,
  bytecode: string,
  pointersData: { pointer: string; pointer2?: string; bytecodeHash: string }[],
  pointer: string,
  network: string,
  pointer2?: string
) => {
  let appendData: { pointer: string; pointer2?: string; bytecodeHash: string } = {
    pointer: pointer,
    bytecodeHash: ethers.utils.keccak256(bytecode),
  };
  if (!!pointer2) {
    appendData.pointer2 = pointer2;
  }
  // Append the new pointer to the data
  pointersData.push(appendData);

  // Write the updated data back to the file
  fs.writeFileSync(pointersFilePath, JSON.stringify(pointersData, null, 2));
  logSuccess(
    `SSTORE2Pointer ${pointer} ${
      !!pointer2 ? pointer : ""
    } has been appended to deployments/${network}/sstore2Pointers.json`
  );
};
