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

// const tokenPairs = [
//     {addressA: "0x4C1BFFF624B54c457c6E6fE13d0016283463158A", addressB: "0x21A0389A91D53aA2e9C7E71303301a2ED237286b", amountA: '150.0', amountB: '150.0', decimalA: 6, decimalB: 18}, // WETH - USDC
//     {addressA: "0xa3b1a0029254E73E434881abe11788fC220B78C8", addressB: "0x21A0389A91D53aA2e9C7E71303301a2ED237286b", amountA: '150.0', amountB: '150.0', decimalA: 6, decimalB: 18}, // WETH - DAI
//     {addressA: "0x60A458fC946419d95C7691625C12476B1F98e0b3", addressB: "0x21A0389A91D53aA2e9C7E71303301a2ED237286b", amountA: '150.0', amountB: '150.0', decimalA: 18, decimalB: 18}, // WETH - USDT
//     {addressA: "0x7C0C089f20EFF7261B4763f85B346731d920F58b", addressB: "0x21A0389A91D53aA2e9C7E71303301a2ED237286b", amountA: '150.0', amountB: '150.0', decimalA: 8, decimalB: 18}, // WETH - BTC
//     {addressA: "0x124085C5999477cFc3E24Ce0C9870De02Fd1E112", addressB: "0x21A0389A91D53aA2e9C7E71303301a2ED237286b", amountA: '150.0', amountB: '150.0', decimalA: 18, decimalB: 18}, // WETH - LINK
//     {addressA: "0xFb975596867c567b378f058689421302333A93B8", addressB: "0x21A0389A91D53aA2e9C7E71303301a2ED237286b", amountA: '150.0', amountB: '150.0', decimalA: 18, decimalB: 18}, // WETH - SHIB
//     {addressA: "0xf84b4b42ffC51a84F32caEd85122674C67C3AC94", addressB: "0x21A0389A91D53aA2e9C7E71303301a2ED237286b", amountA: '150.0', amountB: '150.0', decimalA: 18, decimalB: 18}, // WETH - ALE
// ];

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