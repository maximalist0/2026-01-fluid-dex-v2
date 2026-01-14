import { PopulatedTransaction } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { UUPSUpgradeable__factory } from "../../../typechain-types";
import { deployerSigner, getProxyImplAddress, logDebug, logWarning, TxQueue } from "../../util";

export const setConfigUpgradeProxy = async (
  hre: HardhatRuntimeEnvironment,
  proxyAddress: string,
  implementationAddress: string,
  upgradeToAndCalldata: string // set to empty if only upgrading without call
) => {
  logDebug("-----------------------------------------\n Execute upgradeProxy():");

  logDebug("(setting implementation): ", implementationAddress, "for proxy", proxyAddress + ")");
  logDebug("(with calldata e.g. initialize()): ", upgradeToAndCalldata);

  // check if implementation address is already set at proxy
  const implAddressOnProxy = await getProxyImplAddress(hre, proxyAddress);

  if (implAddressOnProxy.toLowerCase() == implementationAddress.toLowerCase()) {
    logDebug("PROXY NOT UPGRADED: Proxy implementation is already set to", implementationAddress, "\n");

    if (upgradeToAndCalldata && upgradeToAndCalldata !== "0x") {
      logWarning(
        "upgradeToAndCalldata not executed because implementation address was already set!" +
          " VERIFY MANUALLY if this is a problem (make sure executed action in calldata is already done)!"
      );
    }

    return;
  }

  // Assuming this is for UUPSProxies only via owner.
  const proxyContract = UUPSUpgradeable__factory.connect(proxyAddress, await deployerSigner(hre));

  let populatedTx: PopulatedTransaction;
  let methodSig: string;
  let methodParams: any;
  if (upgradeToAndCalldata && upgradeToAndCalldata !== "0x") {
    populatedTx = await proxyContract.populateTransaction.upgradeToAndCall(implementationAddress, upgradeToAndCalldata);
    methodSig = UUPSUpgradeable__factory.createInterface().getFunction("upgradeToAndCall").format();
    methodParams = {
      newImplementation: implementationAddress,
      data: upgradeToAndCalldata,
    };
  } else {
    populatedTx = await proxyContract.populateTransaction.upgradeTo(implementationAddress);
    methodSig = UUPSUpgradeable__factory.createInterface().getFunction("upgradeTo").format();
    methodParams = {
      newImplementation: implementationAddress,
    };
  }

  TxQueue.queue(populatedTx, JSON.stringify(UUPSUpgradeable__factory.abi), proxyAddress, methodSig, methodParams);
};
