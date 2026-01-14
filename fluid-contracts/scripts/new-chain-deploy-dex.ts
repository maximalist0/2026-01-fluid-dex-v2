import { newChainDeployDex } from "./prod";
const hre = require("hardhat");

newChainDeployDex(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
