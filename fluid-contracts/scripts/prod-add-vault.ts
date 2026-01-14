import { prodAddVault } from "./prod";
const hre = require("hardhat");

prodAddVault(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
