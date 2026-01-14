import { prodAddDex } from "./prod";
const hre = require("hardhat");

prodAddDex(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
