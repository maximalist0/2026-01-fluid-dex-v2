import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FluidVersion } from "../../../settings";
import { throwIfAddressZero } from "../../../util";
import { DeployFunction, deploy, executeDeployFunctionForVersion } from "../../util";

export const deployDexFeeHandler = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  minFee: number,
  maxFee: number,
  minDeviation: BigNumber,
  maxDeviation: BigNumber,
  centerPriceActive: boolean,
  dex: string,
  dexName: string
) => {
  const deployFunctions = new Map<FluidVersion, DeployFunction>();
  deployFunctions.set("v1_0_0", deployV1);

  const deployedAddress = await executeDeployFunctionForVersion(
    hre,
    version,
    deployFunctions,
    minFee,
    maxFee,
    minDeviation,
    maxDeviation,
    centerPriceActive,
    dex,
    dexName
  );

  return deployedAddress;
};

const deployV1: DeployFunction = async (
  hre: HardhatRuntimeEnvironment,
  version: FluidVersion,
  args: [number, number, BigNumber, BigNumber, boolean, string, string]
) => {
  const deployerContract = (await hre.deployments.get("DeployerFactory")).address;
  const reserveContract = (await hre.deployments.get("ReserveContractProxy")).address;
  // const deployerContract = "0x4EC7b668BAF70d4A4b0FC7941a7708A07b6d45Be";
  // const reserveContract = "0x264786EF916af64a1DB19F513F24a3681734ce92";

  const minFee = args[0];
  const maxFee = args[1];
  const minDeviation = args[2];
  const maxDeviation = args[3];
  const centerPriceActive = args[4];
  const dex = throwIfAddressZero(args[5], "Dex");
  const dexName = args[6];

  const name = "DexFeeHandler_" + dexName;

  const deployedAddress = await deploy(
    hre,
    name,
    "contracts/config/dexFeeHandler/main.sol:FluidDexFeeHandler",
    version,
    // constructor args:
    // uint256 minFee_,
    // uint256 maxFee_,
    // uint256 minDeviation_,
    // uint256 maxDeviation_,
    // address dex_,
    // address deployerContract_,
    // IFluidReserveContract reserveContract_,
    // bool centerPriceActive_
    [minFee, maxFee, minDeviation, maxDeviation, dex, deployerContract, reserveContract, centerPriceActive]
  );
  return deployedAddress;
};
