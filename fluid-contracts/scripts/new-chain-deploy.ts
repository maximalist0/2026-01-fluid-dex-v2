import { newChainDeploy } from "./prod";
const hre = require("hardhat");

newChainDeploy(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
