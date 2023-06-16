const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// contracts
const muteio_router_contract_address = "0x96c2Cf9edbEA24ce659EfBC9a6e3942b7895b5e8";
const syncswap_router_contract_address = "0xB3b7fCbb8Db37bC6f572634299A58f51622A847e";
const syncswap_factory_contract_address = "0xB6a70D6ab2dE494592546B696208aCEeC18D755f";

// ABI
const muteio_router_contract_abi = require("../../ABI/muteio_router_abi.json");
const syncswap_router_contract_abi = require("../../ABI/syncswap_router_abi.json");
const syncswap_factory_contract_abi = require("../../ABI/syncswap_base_factory_abi.json");
const erc20_abi = require("../../ABI/erc20_abi.json");

// private keys
const PRIVATE_KEY_MAIN = process.env.PRIVATE_KEY_MAIN
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2

// pools - amounts
// ---------------------------------------------------
// WETH - USDC - WBTC - DAI - USDT - SHIB - LINK - ALE
// WETH - USDC => 1WETH == 1850 USDC
// WETH - WBTC => 1WETH == 0.025 WBTC
// WETH - DAI => 1WETH == 1810 DAI
// WETH - USDT => 1WETH == 1825 USDT
// WETH - SHIB => 1WETH == 20000 SHIB
// WETH - LINK => 1WETH == 100 LINK
// WETH - ALE => 1WETH == 750 ALE
const token_amounts_muteio = ["100000", "185000000", "2500", "181000000", "182500000", "200000000", "10000000", "75000000"]; 

// WETH - USDC - WBTC - DAI - USDT - SHIB - LINK - ALE
// WETH - USDC => 1WETH == 1820 USDC
// WETH - WBTC => 1WETH == 0.02 WBTC
// WETH - DAI => 1WETH == 1790 DAI
// WETH - USDT => 1WETH == 1845 USDT
// WETH - SHIB => 1WETH == 1800 SHIB
// WETH - LINK => 1WETH == 110 LINK
// WETH - ALE => 1WETH == 650 ALE
const token_amounts_syncswap = ["100000", "182000000", "2000", "179000000", "184500000", "180000000", "11000000", "65000000"];

module.exports = {
    muteio_router_contract_address,
    syncswap_router_contract_address,
    syncswap_factory_contract_address,
    muteio_router_contract_abi,
    syncswap_router_contract_abi,
    syncswap_factory_contract_abi,
    erc20_abi,
    PRIVATE_KEY_MAIN,
    PRIVATE_KEY_2,
};
