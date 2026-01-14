import { newChainInitialConfigs } from "./prod";
const hre = require("hardhat");

newChainInitialConfigs(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
