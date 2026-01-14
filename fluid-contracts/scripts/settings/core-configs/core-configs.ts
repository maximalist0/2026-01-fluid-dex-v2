import { parseEther } from "ethers/lib/utils";

import { PERCENT_PRECISION } from "../config-utils";
import { LIDO_WITHDRAWAL_QUEUE } from "../contract-addresses";
import { TOKENS_MAINNET } from "../token-addresses";

// @dev set deployer key as Governance etc. for local tests
const DEFAULT_LOCAL_TEST_DEPLOYER_PUBLIC_KEY = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
// for test deployments but via an Avocado Multisig. DO NOT USE FOR PROD.
const TEST_AVOCADO_MULTISIG_GOVERNANCE = "0xD15B0aA03Bc9F74Aa3d07d078502867Da3B7d198";

// default governance. this should stay the same on all networks as it affects core contract
// addresses (e.g. Liquidity proxy address)
export const PROD_AVOCADO_MULTISIG_GOVERNANCE = "0x4F6F977aCDD1177DCD81aB83074855EcB9C2D49e";

// actual Timelock Governance contract on mainnet
export const PROD_GOVERNANCE_TIMELOCK = "0x2386DC45AdDed673317eF068992F19421B481F4c";

// ----------------------------------------------------------
//
//    @dev FOR CORE DEPLOYMENT (and config init), MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

export const GOVERNANCE = PROD_AVOCADO_MULTISIG_GOVERNANCE; // MUST SET to an actual Avocado Multisig (on local test works with EOA)

const LIQUIDITY_REVENUE_COLLECTOR = null; // leave as null to set reserve contract (should be the default)
const LIQUIDITY_AUTHS: string[] = ["0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"];
const LIQUIDITY_GUARDIANS: string[] = [GOVERNANCE];

// @dev reserve contract is set as rebalancer by default for all new fTokens and vaults.
const RESERVE_CONTRACT_OWNER = GOVERNANCE;
const RESERVE_CONTRACT_AUTHS: string[] = ["0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"];
const RESERVE_CONTRACT_REBALANCERS: string[] = [
  "0x3BE5C671b20649DCA5D916b5698328D54BdAAf88", // Avo address
  "0xb287f8A01a9538656c72Fa6aE1EE0117A187Be0C", // EOA
];

const VAULT_FACTORY_DEPLOYERS: string[] = [GOVERNANCE, "0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"];
const VAULT_FACTORY_GLOBAL_AUTHS: string[] = ["0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"];

const LENDING_FACTORY_AUTHS: string[] = ["0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"]; // Note: can update rewards at fTokens, rescue funds
const LENDING_FACTORY_DEPLOYERS: string[] = [GOVERNANCE, "0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"]; // Note: can deploy new fTokens

const DEX_FACTORY_DEPLOYERS: string[] = [GOVERNANCE, "0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"];
const DEX_FACTORY_GLOBAL_AUTHS: string[] = ["0x0Ed35B1609Ec45c7079E80d11149a52717e4859A"];

const STETH_MAX_LTV = 90 * PERCENT_PRECISION; // in 1e2 (1% = 100, 90% = 9_000, 100% = 10_000).

const HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_ETH = parseEther("100000000"); // 100M
const HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_ARBITRUM = parseEther("50000000"); // 50M
const HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_BASE = parseEther("50000000"); // 50M
const HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_POLYGON = parseEther("8000000000"); // 8B
const HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_PLASMA = parseEther("10000000000"); // 10B

// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const coreContractsConfig = () => ({
  liquidity: {
    governance: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
    revenueCollector: LIQUIDITY_REVENUE_COLLECTOR,
    auths: LIQUIDITY_AUTHS,
    guardians: LIQUIDITY_GUARDIANS,
    nativeTokenMaxBorrowLimitHardCap: (network: string) => {
      switch (network) {
        case "hardhat":
        case "localhost":
        case "mainnet":
          return HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_ETH; // 120M
        case "arbitrum":
          return HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_ARBITRUM; // 50M
        case "base":
          return HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_BASE; // 50M
        case "polygon":
          return HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_POLYGON;
        case "plasma":
          return HARD_BORROW_CAP_CHECK_NATIVE_TOKEN_SUPPLY_PLASMA;
        default:
          throw new Error("native token total supply for borrow max limit sanity check not defined");
      }
    },
  },
  lending: {
    lendingFactory: {
      owner: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
      auths: LENDING_FACTORY_AUTHS,
      deployers: LENDING_FACTORY_DEPLOYERS,
    },
  },
  reserve: {
    owner: RESERVE_CONTRACT_OWNER,
    auths: RESERVE_CONTRACT_AUTHS,
    rebalancers: RESERVE_CONTRACT_REBALANCERS,
  },
  vault: {
    governance: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
    vaultFactory: {
      owner: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
      deployers: VAULT_FACTORY_DEPLOYERS,
      globalAuths: VAULT_FACTORY_GLOBAL_AUTHS,
    },
  },
  dex: {
    governance: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
    dexFactory: {
      owner: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
      deployers: DEX_FACTORY_DEPLOYERS,
      globalAuths: DEX_FACTORY_GLOBAL_AUTHS,
    },
    smartLendingFactory: {
      owner: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
    },
  },
  steth: {
    // @dev only works on ETH mainnet
    owner: GOVERNANCE, // DEPLOYMENT (setting configs) VERY LIKELY BREAKS IF THIS IS CHANGED
    lidoWithdrawalQueue: LIDO_WITHDRAWAL_QUEUE,
    steth: TOKENS_MAINNET.STETH.address,
    maxLTV: STETH_MAX_LTV, // in 1e2 (1% = 100, 90% = 9_000, 100% = 10_000).

    // Note ProxyAdmin is Owner (UUPS proxy)
  },
});
