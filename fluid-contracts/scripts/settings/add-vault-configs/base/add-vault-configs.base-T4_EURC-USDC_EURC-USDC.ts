import { BigNumber, ethers } from "ethers";

import { VAULT_TYPE } from "../config-utils";
import { NATIVE_TOKEN, TOKENS_BASE } from "../token-addresses";
import { DexSmartT4CLOracleConfig, DexSmartT4CLOracleL2Config } from "./add-vault-interfaces";
// ----------------------------------------------------------
//
//    @dev FOR ADDING A VAULT, MUST CONFIGURE VARIABLES BELOW:
//
// ----------------------------------------------------------

// IMPORTANT: IF YOU QUEUE MULTIPLE VAULT DEPLOYMENTS, INCREASE THE COUNTER ACCORDING TO THE QUEUE
// AND EXECUTE VAULT DEPLOYMENTS IN THE ORDER THEY WERE CREATED.
// important because vault logs etc. are affected by vaultId, which is increased by one for each new deployment
const VAULT_QUEUE_COUNTER = 0; // id 31

const VAULTTYPE = VAULT_TYPE.T4_SMART_COL_SMART_DEBT;

const SUPPLY_TOKEN = TOKENS_BASE.DEX_EURC_USDC.address;

const BORROW_TOKEN = TOKENS_BASE.DEX_EURC_USDC.address;

const ORACLE_CONFIG: DexSmartT4CLOracleL2Config = {
  oracleName: "DexSmartT4CLOracleL2_EURC-USDC",
  contractName: "DexSmartT4CLOracleL2",
  params: {
    dexPool: BORROW_TOKEN,
    quoteInToken0: false, // quote in USDC
    infoName: "EURC/USDC dbtSh. per 1 colSh.",
    targetDecimals: 27,
    // set e.g. 3030_860405935798293 USDC per ETH as price, CL oracle must always set token1/token0, so ETH per USDC.
    // ChainlinkOracleImpl scales to ETH / USDC scaled to 1e27, result is 329939312955999000000000000000000000.
    // adjust decimals to be in expected rate as used internally in Fluid Dex, e.g. 325151118254488344854528.
    // so set via multiplier & divisor to divide 1e12
    // MOCK_CHAINLINK_FEED.setExchangeRate(int256(329939312955999));
    reservesConversion: {
      hops: 2,
      feed1: {
        feed: "0xDAe398520e2B67cd3f27aeF9Cf14D93D927f8250", // EURC <> USD https://data.chain.link/feeds/base/base/eurc-usd
        invertRate: false,
        token0Decimals: 6,
      },
      feed2: {
        feed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B", // USDC <> USD https://data.chain.link/feeds/base/base/usdc-usd
        invertRate: true,
        token0Decimals: 6,
      },
      feed3: {
        feed: ethers.constants.AddressZero,
        invertRate: false,
        token0Decimals: 0,
      },
    },
    // reserves conversion price must end up at e27 scale same as underlying dex price
    // e.g. 97639.999988300472680839160791040 USDC per EURC. USDC per EURC scaled to e27 ends up in e27 decimals (0 decimals diff)
    // so no need to adjust multiply or divide
    reservesConversionPriceMultiplier: 1,
    reservesConversionPriceDivisor: 1,
    //
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
