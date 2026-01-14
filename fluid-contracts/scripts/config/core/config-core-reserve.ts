import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { deployerSigner, logDebug, logSuccess, throwIfAddressZero } from "../../util";
import { coreContractsConfig, FluidVersion } from "../../settings";
import { setConfigUpgradeProxy } from "../config-scripts";
import { FluidReserveContract__factory } from "../../../typechain-types";

/// @notice initializes the contract
/// @param _auths  The addresses that have the auth to approve and revoke protocol token allowances
/// @param _rebalancers  The addresses that can execute a rebalance on a protocol
/// @param owner_  owner address is able to upgrade contract and update auth users
// function initialize(
//     address[] memory _auths,
//     address[] memory _rebalancers,
//     address owner_
// ) public initializer validAddress(owner_) {

export const configCoreReserve = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n------------------------ RESERVE CONFIGS -------------------\n");

  const proxyAddress = (await hre.deployments.get("ReserveContractProxy")).address;

  const config = coreContractsConfig().reserve;

  const owner = throwIfAddressZero(config.owner, "Reserve contract Owner");

  const reserveContract = FluidReserveContract__factory.connect(proxyAddress, await deployerSigner(hre));
  // check if initialize was already executed on ReserveContractProxy (only upgrade)
  const initializedStorageVar = await hre.ethers.provider.getStorageAt(proxyAddress, 0);
  let initializeCalldata = "";
  if (initializedStorageVar !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
    initializeCalldata = (await reserveContract.populateTransaction.initialize(config.auths, config.rebalancers, owner))
      .data as string;
  }

  if (initializeCalldata === "") {
    logDebug("Skipped initialize() at ReserveContractProxy because it was already executed before.");
  } else {
    logDebug("Added initialize() to be executed at ReserveContractProxy");
  }

  // upgrade proxy from EmptyImplementationUUPS to actual ReserveContract impl and set auths, rebalancers and owner in initialize
  await setConfigUpgradeProxy(
    hre,
    proxyAddress,
    (
      await hre.deployments.get("ReserveContract")
    ).address,
    initializeCalldata
  );

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Done all steps for Fluid", version.replace(/_/g, "."), "Reserve config txs!\n"));
};
