import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import { ContractTransaction, ethers, utils } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  IERC20Metadata__factory,
  IFluidDexT1__factory,
  IFluidLiquidityResolver__factory,
  IFluidLiquidity__factory,
} from "../../typechain-types";
import { deploymentsConfig } from "../settings";
import { NATIVE_TOKEN } from "../settings/token-addresses";

export const LiquiditySlotsLink = {
  LIQUIDITY_STATUS_SLOT: 1,
  LIQUIDITY_AUTHS_MAPPING_SLOT: 2,
  LIQUIDITY_GUARDIANS_MAPPING_SLOT: 3,
  LIQUIDITY_USER_CLASS_MAPPING_SLOT: 4,
  LIQUIDITY_EXCHANGE_PRICES_MAPPING_SLOT: 5,
  LIQUIDITY_RATE_DATA_MAPPING_SLOT: 6,
  LIQUIDITY_TOTAL_AMOUNTS_MAPPING_SLOT: 7,
  LIQUIDITY_USER_SUPPLY_DOUBLE_MAPPING_SLOT: 8,
  LIQUIDITY_USER_BORROW_DOUBLE_MAPPING_SLOT: 9,
};

export const DexSlotsLink = {
  DEX_VARIABLES_SLOT: 0,
  DEX_VARIABLES2_SLOT: 1,
  DEX_TOTAL_SUPPLY_SHARES_SLOT: 2,
  DEX_USER_SUPPLY_MAPPING_SLOT: 3,
  DEX_TOTAL_BORROW_SHARES_SLOT: 4,
  DEX_USER_BORROW_MAPPING_SLOT: 5,
  DEX_ORACLE_MAPPING_SLOT: 6,
  DEX_RANGE_THRESHOLD_SHIFTS_SLOT: 7,
  DEX_CENTER_PRICE_SHIFT_SLOT: 8,
};

export const getTokenSymbol = async (hre: HardhatRuntimeEnvironment, token: string) => {
  if (token != NATIVE_TOKEN.address) {
    let symbol: string;
    try {
      symbol = await IERC20Metadata__factory.connect(token, await deployerSigner(hre)).symbol();
    } catch {
      // must be DEX
      const dexConstants = await IFluidDexT1__factory.connect(token, await deployerSigner(hre)).constantsView();
      symbol = `DEX-${await getTokenSymbol(hre, dexConstants.token0)}-${await getTokenSymbol(
        hre,
        dexConstants.token1
      )}`;
    }
    return symbol;
  }

  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "localhost" ||
    hre.network.name === "hardhat" ||
    hre.network.name === "arbitrum" ||
    hre.network.name === "base"
  ) {
    return "ETH";
  }
  if (hre.network.name === "polygon") {
    return "POL";
  }
  if (hre.network.name === "plasma") {
    return "XPL";
  }

  throw new Error("native token name not defined for network " + hre.network.name);
};

export const deployerAddress = async (hre: HardhatRuntimeEnvironment): Promise<string> => {
  const { deployer } = await hre.getNamedAccounts();

  return deployer;
};

export const deployerSigner = async (hre: HardhatRuntimeEnvironment): Promise<SignerWithAddress> => {
  const deployerAddr = await deployerAddress(hre);
  return hre.ethers.getSigner(deployerAddr);
};

export const contractFullyQualifiedName = (name: string, contractPath: string) => {
  return `${contractPath}:${name}`;
};

export const getLiquidityWithSigner = async (hre: HardhatRuntimeEnvironment, signer: SignerWithAddress) => {
  const liquidity = await hre.deployments.get("Liquidity");

  return IFluidLiquidity__factory.connect(liquidity.address, signer);
};

export const getLiquidityResolverWithSigner = async (hre: HardhatRuntimeEnvironment, signer: SignerWithAddress) => {
  const liquidityResolver = await hre.deployments.get("LiquidityResolver");

  return IFluidLiquidityResolver__factory.connect(liquidityResolver.address, signer);
};

export const isLocalNetwork = (network: string) => {
  return ["hardhat", "localhost"].includes(network);
};

export const getProxyImplAddress = async (hre: HardhatRuntimeEnvironment, proxyAddress: string) => {
  const implAddressOnProxy = hre.ethers.utils.defaultAbiCoder.decode(
    ["address"],
    await hre.ethers.provider.getStorageAt(
      proxyAddress,
      // hardcoded slot: bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    )
  )[0];

  return implAddressOnProxy;
};

export const getContractSuccessReceipt = async (hre: HardhatRuntimeEnvironment, tx: ContractTransaction) => {
  const receipt = await tx.wait(deploymentsConfig.waitConfirmations(hre.network.name));

  if (receipt.status !== 1) {
    throw new Error("!! ERROR: TX FAILED. Check the cause, tx hash: " + receipt.transactionHash);
  }

  return {
    ...receipt,
    logDebugMessage: () => {
      logDebug("Transaction successful, tx hash: ", receipt.transactionHash, ". (Gas used: " + receipt.gasUsed + ")\n");
    },
  };
};

export const calculateMappingStorageSlot = (slot: number, key: string) => {
  // same as LiquiditySlotsLink.calculateMappingStorageSlot ->
  // return keccak256(abi.encode(key_, slot_));
  return utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [key, slot]));
};

export const calculateDoubleMappingStorageSlot = (slot: number, key1: string, key2: string) => {
  // same as LiquiditySlotsLink.calculateDoubleMappingStorageSlot ->
  // bytes32 intermediateSlot_ = keccak256(abi.encode(key1_, slot_));
  // return keccak256(abi.encode(key2_, intermediateSlot_));
  const intermediateSlot = calculateMappingStorageSlot(slot, key1);
  return utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [key2, intermediateSlot]));
};

export const getContractFunctionSigs = (contractInterface: ethers.utils.Interface) => {
  const functions: string[] = Object.keys(contractInterface.functions);
  const sigs = new Set<string>();
  for (let i = 0; i < functions.length; i++) {
    logDebug("adding sig", contractInterface.getSighash(functions[i]), "for function", functions[i]);
    sigs.add(contractInterface.getSighash(functions[i]));
  }
  return [...sigs.keys()];
};

export const logError = (...text: unknown[]) => console.log(chalk.red.underline.bold("\nERROR:"), ...text);
export const logWarning = (...text: unknown[]) => console.log(chalk.yellow.bold("\nWARNING:"), ...text);
export const logSuccess = (...text: unknown[]) => console.log(chalk.green(...text));
export const logDebug = (...text: unknown[]) => console.log(chalk.gray(...text));
