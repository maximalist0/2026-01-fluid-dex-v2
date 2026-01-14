import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { logDebug, logSuccess, throwIfAddressZero } from "../../util";
import { coreContractsConfig, FluidVersion } from "../../settings";
import {
  setConfigLiquidityAuths,
  setConfigLiquidityGuardians,
  setConfigLiquidityProxyAddImplementation,
  setConfigLiquidityProxySetDummyImplementation,
  setConfigLiquidityRevenueCollector,
} from "../../config";
import { FluidLiquidityUserModule__factory, FluidLiquidityAdminModule__factory } from "../../../typechain-types";

export const configCoreLiquidity = async (hre: HardhatRuntimeEnvironment, version: FluidVersion) => {
  logDebug("\n\n------------------------ LIQUIDITY CONFIGS -------------------\n");

  // set actual LiquidityDummyImpl (is initially set to EmptyImplementation)
  await setConfigLiquidityProxySetDummyImplementation(hre, (await hre.deployments.get("LiquidityDummyImpl")).address);

  // addImplementation at proxy for AdminModule
  await setConfigLiquidityProxyAddImplementation(
    hre,
    (
      await hre.deployments.get("AdminModule")
    ).address,
    FluidLiquidityAdminModule__factory.createInterface()
  );

  // addImplementation at proxy for UserModule
  await setConfigLiquidityProxyAddImplementation(
    hre,
    (
      await hre.deployments.get("UserModule")
    ).address,
    FluidLiquidityUserModule__factory.createInterface()
  );

  // set RevenueCollector at Liquidity
  let revenueCollector: string = coreContractsConfig().liquidity.revenueCollector as any;
  if (!revenueCollector || revenueCollector == "" || revenueCollector == hre.ethers.constants.AddressZero) {
    revenueCollector = (await hre.deployments.get("ReserveContractProxy")).address;
  }

  await setConfigLiquidityRevenueCollector(hre, throwIfAddressZero(revenueCollector, "Liquidity revenueCollector"));

  // set auths
  const auths = coreContractsConfig().liquidity.auths;
  if (auths.length) {
    auths.forEach((auth) => throwIfAddressZero(auth, "Liquidity auth"));
    await setConfigLiquidityAuths(hre, auths);
  } else {
    logDebug("\nNo auths configured to add at Liquidity.");
  }

  // set guardians
  const guardians = coreContractsConfig().liquidity.guardians;
  if (guardians.length) {
    guardians.forEach((auth) => throwIfAddressZero(auth, "Liquidity guardian"));
    await setConfigLiquidityGuardians(hre, guardians);
  } else {
    logDebug("\nNo guardians configured to add at Liquidity.");
  }

  logDebug("\n-----------------------------------------");
  logSuccess(chalk.bold.underline("Done all steps for Fluid", version.replace(/_/g, "."), "Liquidity config txs!\n"));
};
