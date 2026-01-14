import chalk from "chalk";
import { PopulatedTransaction } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";

import { deployerSigner, isLocalNetwork, logDebug, logSuccess } from "./util";

interface QueuedTransaction {
  target: string;
  calldata: string;
  // params below are required to be able to properly preview the txs on Avocado + execute the simulation there.
  // Being able to do that is important as gas cost for deployments here are significant.
  abi: string;
  contractAddress: string; // addresss for referenced ABI contract. can be different from target (e.g. in case of Vault -> Secondary / Admin)
  method: string;
  methodParams: any;
}

interface JsonBatchTransaction {
  abi: string;
  raw: string;
  toAddress: string;
  contractAddress: string;
  value: 0;
  chainId: number;
  method: string;
  methodParams: any;
}

class TransactionsQueue {
  private static instance: TransactionsQueue;
  private transactionsQueue: QueuedTransaction[] = [];

  private constructor() {}

  static getInstance(): TransactionsQueue {
    if (!TransactionsQueue.instance) {
      TransactionsQueue.instance = new TransactionsQueue();
    }
    return TransactionsQueue.instance;
  }

  public queue(
    populatedTx: PopulatedTransaction,
    abi: string,
    abiContractAddress: string,
    method: string,
    methodParams: any
  ) {
    this.transactionsQueue.push({
      target: populatedTx.to as string,
      calldata: populatedTx.data as string,
      abi: abi || "",
      contractAddress: abiContractAddress || "",
      method: method || "",
      methodParams,
    });

    logSuccess("[TX_QUEUE_ADD]:", method, "at:", populatedTx.to as string);
  }

  public resetClearQueue() {
    this.transactionsQueue = [];
  }

  public async processQueue(hre: HardhatRuntimeEnvironment, batchFileName: string) {
    logDebug("\n\n------------------- PROCESSING TX QUEUE -------------------\n");

    if (!this.transactionsQueue.length) {
      logDebug("No txs in queue.");
    } else {
      if (isLocalNetwork(hre.network.name)) {
        // Execute, assuming governance / owner is deployer everywhere
        await this.executeQueueLocalOrDeployer(hre);
        // await this.exportToJsonBatch(hre, batchFileName);
      } else {
        // Governance / owner MUST be Avocado Multisig. Creating batch json file to import into Avocado Tx builder
        await this.exportToJsonBatch(hre, batchFileName);
      }
    }
    logDebug("\n-----------------------------------------");
    logSuccess(chalk.bold.underline("DONE PROCESSING TX QUEUE!\n"));
  }

  public async processQueueDeployer(hre: HardhatRuntimeEnvironment) {
    if (!this.transactionsQueue.length) {
      logDebug("No txs in queue.");
    } else {
      // Execute, assuming governance / owner is deployer everywhere
      await this.executeQueueLocalOrDeployer(hre);
    }
    logDebug("\n-----------------------------------------");
    logSuccess(chalk.bold.underline("DONE PROCESSING TX QUEUE!\n"));
  }

  private async executeQueueLocalOrDeployer(hre: HardhatRuntimeEnvironment) {
    logDebug("Executing Tx Queue from deployer address\n");

    const deployer = await deployerSigner(hre);

    let totalGasCost = 0;

    for (let tx of this.transactionsQueue) {
      logDebug("[TX_QUEUE_EXECUTE_LOCAL_OR_DEPLOYER]: ", tx.method, "at:", tx.target);

      const executedTx = await deployer.sendTransaction({
        to: tx.target,
        data: tx.calldata,
      });

      const receipt = await executedTx.wait();

      totalGasCost += receipt.gasUsed.toNumber();

      logDebug(
        `                        -> Executed. (Gas cost: ${receipt.gasUsed.toNumber()}. Total gas cost now: ${totalGasCost})`
      );
    }
  }

  private async exportToJsonBatch(hre: HardhatRuntimeEnvironment, batchFileName: string) {
    const batch: JsonBatchTransaction[] = [];

    const chainId = parseInt(await hre.getChainId());

    for (let tx of this.transactionsQueue) {
      logDebug("[TX_QUEUE_ADD_TO_BATCH_FILE]: ", tx.method, "at:", tx.target);

      batch.push({
        abi: tx.abi,
        raw: tx.calldata,
        toAddress: tx.target,
        contractAddress: tx.contractAddress,
        value: 0,
        chainId,
        method: tx.method,
        ...tx.methodParams,
      });
    }

    const batchData = {
      batch: batch.map((elem) => ({
        formValues: elem,
      })),
      version: "1.0.0",
    };

    const json = JSON.stringify(batchData, null, 2);

    if (!fs.existsSync("txs-batches")) {
      fs.mkdirSync("txs-batches");
    }

    const fullFilePath = `txs-batches/${hre.network.name}-${batchFileName}.json`;
    fs.writeFileSync(fullFilePath, json);

    console.log(`\nExported batch json file for execution to ${fullFilePath}\n`);

    this.resetClearQueue();
  }
}

// Export the singleton instance
export const TxQueue = TransactionsQueue.getInstance();
