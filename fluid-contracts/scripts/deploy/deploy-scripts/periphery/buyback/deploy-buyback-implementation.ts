import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../../util";
import { coreContractsConfig, FluidVersion } from "../../../../settings";
import { throwIfAddressZero } from "../../../../util";

export const deployBuybackImplementation = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
    const deployFunctions = new Map<FluidVersion, DeployFunction>();
    deployFunctions.set("v1_0_0", deployV1);

    const deployedAddress = await executeDeployFunctionForVersion(hre, version, deployFunctions);

    return deployedAddress;
};

const deployV1: DeployFunction = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
    const deployedAddress = await deploy(
        hre,
        "FluidBuybackImplementation",
        "contracts/periphery/buyback/main.sol:FluidBuyback",
        version,
        []
    );
    return deployedAddress;
};
