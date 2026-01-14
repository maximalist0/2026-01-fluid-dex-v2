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
const VAULT_QUEUE_COUNTER = 0; // id 77

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_MAINNET.DEX_USDC_ETH.address;

const BORROW_TOKEN = TOKENS_MAINNET.DEX_USDC_ETH.address;

const ORACLE_CONFIG: DexSmartT4CLOracleConfig = {
  oracleName: "DexSmartT4CLOracle_USDC-ETH",
  contractName: "DexSmartT4CLOracle",
  infoName: "USDC/ETH dbtSh. per 1 colSh.",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in ETH
    infoName: "USDC/ETH dbtSh. per 1 colSh.",
    // set e.g. 3030_860405935798293 USDC per ETH as price, CL oracle must always set token1/token0, so ETH per USDC.
    // ChainlinkOracleImpl scales to ETH / USDC scaled to 1e27, result is 329939312955999000000000000000000000.
    // adjust decimals to be in expected rate as used internally in Fluid Dex, e.g. 325151118254488344854528.
    // so set via multiplier & divisor to divide 1e12
    // MOCK_CHAINLINK_FEED.setExchangeRate(int256(329939312955999));
    reservesConversion: {
      hops: 1,
      feed1: {
        feed: "0x986b5e1e1755e3c2440e960477f25201b0a8bbd4", // USDC <> ETH
        invertRate: false,
        token0Decimals: 6,
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
    // diff between USDC and shares decimals, adjusting CL price:
    reservesConversionPriceMultiplier: 1,
    reservesConversionPriceDivisor: 1e12,
    // diff between ETH and shares decimal, adjusting final price (already quoting in ETH so no decimals diff):
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
