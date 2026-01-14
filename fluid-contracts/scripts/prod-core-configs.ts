import { prodInitialConfigs } from "./prod";
const hre = require("hardhat");

prodInitialConfigs(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
