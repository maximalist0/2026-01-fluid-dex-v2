import { prodListToken } from "./prod";
const hre = require("hardhat");

prodListToken(hre).catch((error: any) => {
  console.error(error);
  process.exitCode = 1;
});
