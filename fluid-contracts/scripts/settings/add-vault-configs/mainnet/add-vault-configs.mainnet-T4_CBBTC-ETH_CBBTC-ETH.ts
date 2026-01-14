import { VAULT_TYPE } from "../config-utils";
import { DexSmartT4CLOracleConfig } from "./add-vault-interfaces";
import { NATIVE_TOKEN, TOKENS_MAINNET } from "../token-addresses";

// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 106

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_CBBTC_ETH.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_CBBTC_ETH.address;

const ORACLE_CONFIG: DexSmartT4CLOracleConfig = {
  oracleName: "DexSmartT4CLOracle_CBBTC-ETH",
  contractName: "DexSmartT4CLOracle",
  infoName: "CBBTC/ETH dbtSh. per 1 colSh.",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in ETH
    infoName: "CBBTC/ETH dbtSh. per 1 colSh.",
    reservesConversion: {
      hops: 1,
      feed1: {
        feed: "0xAc559F25B1619171CbC396a50854A3240b6A4e99", // ETH <> BTC feed https://data.chain.link/feeds/ethereum/mainnet/eth-btc
        invertRate: true,
        token0Decimals: 18,
      },
      feed2: {
        feed: ethers.constants.AddressZero,
        invertRate: false,
        token0Decimals: 0,
      },
      feed3: {
        feed: ethers.constants.AddressZero,
        invertRate: false,
        token0Decimals: 0,
      },
    },
    // reserves conversion price must end up at e27 scale same as underlying dex price
    // e.g. 39.999999982088047918426619904 ETH per BTC. reserves ETH per BTC scaled to e27 ends up in e37 decimals (+10 decimals diff)
    // e.g. 399254293956490304566877765366934866933, so need to divide by 1e10 to get to 1e27
    reservesConversionPriceMultiplier: 1,
    reservesConversionPriceDivisor: 1e10,
    // diff shares / shares = 0
    resultMultiplier: 1,
    resultDivisor: 1,
  },
};

//#region no changes needed below, just for exporting to use in scripts
// ----------------------------------------------------------
//
//              NO ADDITIONAL CONFIG NEEDED BELOW
//
// ----------------------------------------------------------

export const addVaultConfigs = () => ({
  vaultType: VAULTTYPE,
  addToVaultIdCounter: VAULT_QUEUE_COUNTER,
  supplyToken: SUPPLY_TOKEN,
  borrowToken: BORROW_TOKEN,
  oracle: ORACLE_CONFIG,
});
//#endregion
