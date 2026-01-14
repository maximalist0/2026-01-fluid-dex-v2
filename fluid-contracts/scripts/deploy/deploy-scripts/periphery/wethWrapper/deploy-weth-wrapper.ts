import { HardhatRuntimeEnvironment } from "hardhat/types";
import { setConfigUpgradeProxy } from "../../../../config";

import { FluidWETHWrapper__factory } from "../../../../../typechain-types";

import { FluidVersion } from "../../../../settings";
import { networkTokens, wNativeToken } from "../../../../settings/token-addresses";
import { deployerSigner, throwIfAddressZero, TxQueue } from "../../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../../util";
import { deployEmptyImplementationUUPSDeployer } from "../../mocks";

export const deployWethWrapperWithProxy = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  vault: string,
  identifierName: string
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions, vault, identifierName);

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [string, string]
) => {
  const vault: string = throwIfAddressZero(args[0], "Weth wrapper vault");
  const identifierName = args[1];
  const weth = wNativeToken(hre.network.name).address;

  const deployedAddress = await deploy(
    hre,
    "WETHWrapper_" + identifierName,
    "contracts/periphery/wethWrapper/main.sol:FluidWETHWrapper",
    version,
    // constructor args: vault, weth
    [vault, weth]
  );

  const emptyImplementationUUPSDeployer = await deployEmptyImplementationUUPSDeployer(hre);

  // deploy proxy
  const proxyAddress = await deploy(
    hre,
    "WETHWrapperProxy_" + identifierName,
    "contracts/periphery/wethWrapper/proxy.sol:FluidWethWrapperProxy",
    "v1_0_0",
    [emptyImplementationUUPSDeployer, "0x"]
  );

  const wrapperInstance = FluidWETHWrapper__factory.connect(proxyAddress, await deployerSigner(hre));
  await setConfigUpgradeProxy(
    hre,
    proxyAddress,
    deployedAddress,
    (
      await wrapperInstance.populateTransaction.initialize()
    ).data as string
  );
  await TxQueue.processQueueDeployer(hre);

  return proxyAddress;
};
