import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

import { deployLiquidity, deployLending, deployVault, deployReserve, deployFluidWallet } from "../deploy";
import { logDebug, logSuccess, TxQueue } from "../util";
import { FluidVersion, peripheryContractsConfig } from "../settings";
import {
  deployLiquidationContract,
  deployLiquidatorImplementationContract,
  deployLiquidatorProxyContract,
  deployLiquidators,
} from "../deploy/deploy-scripts";
import { deployDeployerFactory } from "../deploy/deploy-scripts/deployer";
import { AVOCADO_TEAM_MULTISIG } from "../settings/contract-addresses";

export const newChainDeploy = async (hre: HardhatRuntimeEnvironment) => {
  logDebug("\n\n------------------- FLUID NEW CHAIN DEPLOYMENT -------------------\n");

  const version: FluidVersion = "v1_0_0";

  // Guide to deploy Fluid on a new chain:
  // 1. check out branch "new-chain-deploy-core-frozen"
  // 2. set up hardhat-config.ts for the new chain
  // 3. Likely never needed: ensure Liquidity governance address, factories owner is as expected (changing will lead to different contract addresses).
  // 4. execute new-chain-deploy script: `npx hardhat run scripts/new-chain-deploy.ts --network <network>`
  // 5. create commit on branch "new-chain-deploy-core-frozen" and push
  // 6. check out master branch, create a new branch for new chain deployment, e.g. "feature/deploy-arb"
  // 7. cherry pick the commit created on "new-chain-deploy-core-frozen"
  // 8. continue with rest of deployment:
  //    set all configs in core-configs.ts and periphery-configs.ts
  //      (consider things such as owner for Liquidator contract might be Team Multisig on new chains!)
  // 9. execute new-chain-deploy and new-chain-initial-config scripts:
  //      - `npx hardhat run scripts/new-chain-deploy.ts --network <network>`
  //      - `npx hardhat run scripts/new-chain-initial-configs.ts --network <network>`

  await deployLiquidity(hre, version);

  await deployReserve(hre, version);

  await deployLending(hre, version);

  await deployVault(hre, version);

  await deployFluidWallet(hre, version);

  await deployDeployerFactory(hre, version, AVOCADO_TEAM_MULTISIG);

  await deployLiquidators(hre, version);

  await TxQueue.processQueue(hre, hre.network.name + "-deploy");

  logDebug("\n-----------------------------------------");
  logSuccess(
    chalk.bold.underline("Executed all steps for Fluid", version.replace(/_/g, "."), "new chain deployment!\n")
  );
  console.log(
    chalk.underline.bold("Next steps:\n"),
    "1. mark the proxy contracts as proxy on the block explorer.\n",
    "2. execute setting initial config txs (upgrade proxies, set configs etc.): `npx hardhat run scripts/new-chain-initial-configs.ts --network <network>`\n"
  );
};
