import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { deployerSigner, logDebug, logSuccess, throwIfAddressZero } from "../../util";
import { FluidVersion, peripheryContractsConfig } from "../../settings";
import { setConfigFluidWalletFactoryChangeImplementation, setConfigUpgradeProxy } from "../config-scripts";
import { FluidWalletFactory__factory } from "../../../typechain-types";

export const configPeripheryWallet = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n------------------------ FLUID WALLET CONFIGS -------------------\n");

  /// @notice initializes the contract with `owner_` as owner
  // function initialize(address owner_) public initializer {

  const proxyAddress = (await hre.deployments.get("FluidWalletFactoryProxy")).address;

  const config = peripheryContractsConfig(hre.network.name).wallet;

  const owner = throwIfAddressZero(config.factoryOwner, "Fluid wallet factory Owner");

  const walletFactory = FluidWalletFactory__factory.connect(proxyAddress, await deployerSigner(hre));
  // check if initialize was already executed on FluidWalletFactoryProxy (only upgrade)
  const initializedStorageVar = await hre.ethers.provider.getStorageAt(proxyAddress, 0);
  let initializeCalldata = "";
  if (initializedStorageVar !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
    initializeCalldata = (await walletFactory.populateTransaction.initialize(owner)).data as string;
  }

  if (initializeCalldata === "") {
    logDebug("Skipped initialize() at FluidWalletFactoryProxy because it was already executed before.");
  } else {
    logDebug("Added initialize() to be executed at FluidWalletFactoryProxy");
  }

  // upgrade proxy from EmptyImplementationUUPS to actual FluidWalletFactory impl and set owner in initialize
  await setConfigUpgradeProxy(
    hre,
    proxyAddress,
    (
      await hre.deployments.get("FluidWalletFactory")
    ).address,
    initializeCalldata
  );

  // set implementation address
  // function changeImplementation(address implementation_) public onlyOwner {
  const walletImplementation = (await hre.deployments.get("FluidWalletImplementation")).address;
  await setConfigFluidWalletFactoryChangeImplementation(hre, walletImplementation);

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Done all steps for Fluid", version.replace(/_/g, "."), "Fluid wallet config txs!\n")
  );
};
