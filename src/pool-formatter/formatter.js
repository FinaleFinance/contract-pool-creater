const { ethers } = require("ethers");
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const filePath_pool = path.resolve(__dirname, '..', '..', './Addresses/poolAddresses.json');
const filePath_format = path.resolve(__dirname, '..', '..', './Addresses/poolsFormat.json');
const filePath_erc20 = require("../../ABI/erc20_abi.json")
const syncswap_pool_abi = require("../../ABI/syncswap_pool_abi.json");
const muteio_pool_abi = require("../../ABI/muteio_pool_abi.json");
const PRIVATE_KEY = process.env.PRIVATE_KEY_2
const provider = new ethers.providers.JsonRpcProvider(`https://zksync2-testnet.zksync.dev`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function main() {
    try {
      const data = await fs.readFile(filePath_pool, 'utf8');
      const json = JSON.parse(data);
      
      let tasks = json.map(async (item) => {  // map instead of forEach
        if (item.pool.startsWith('Muteio')) {
          return muteio(item);  // return promise
        } else if (item.pool.startsWith('Syncswap')) {
          return syncswap(item);  // return promise
        } else {
          console.log(`No matching "pool" value found: ${item.pool}`);
          return null;
        }
      });
  
      let results = await Promise.all(tasks);  // wait for all promises to resolve
      results = results.filter(result => result !== null);  // filter out nulls
  
      await fs.writeFile(filePath_format, JSON.stringify(results, null, 2));
      console.log('File written successfully');
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
async function muteio(item) {
    const pool_interface = new ethers.Contract(item.address, muteio_pool_abi, wallet);
    const pool_token0 = await pool_interface.token0();
    const token0_interface = new ethers.Contract(pool_token0, filePath_erc20, wallet);
    const token0_name = await token0_interface.name();
    const token0_symbol = await token0_interface.symbol();
    const token0_decimal = await token0_interface.decimals();
    const pool_token1 = await pool_interface.token1();
    const token1_interface = new ethers.Contract(pool_token1, filePath_erc20, wallet);
    const token1_name = await token1_interface.name();
    const token1_symbol = await token1_interface.symbol();
    const token1_decimal = await token1_interface.decimals();
    const pool_reserves = await pool_interface.getReserves();
    const pool_reserves_0 = (pool_reserves[0] / (10**token0_decimal)).toString()
    const pool_reserves_1 = (pool_reserves[1] / (10**token1_decimal)).toString()
    return {
        id: "Muteio-"+item.address,
        type: "pool",
        attributes: {
            address: item.address,
            name: token0_symbol + " / " + token1_symbol,
            base_token_price_quote_token: pool_reserves_1 / pool_reserves_0,
            quote_token_price_base_token: pool_reserves_0 / pool_reserves_1,
            swap_fee: "0.3"
        },
        relationships: {
            dex: {
                data: {
                    id: "Muteio",
                    type: "dex"
                }
            },
            base_token: {
                data: {
                    name: token0_name,
                    symbol: token0_symbol,
                    reserves: Number(pool_reserves_0),
                    contract_address: pool_token0,
                    decimals: Number(token0_decimal.toString()),
                    type: "token"
                }
            },
            quote_token: {
                data: {
                    name: token1_name,
                    symbol: token1_symbol,
                    reserves: Number(pool_reserves_1),
                    contract_address: pool_token1,
                    decimals: Number(token1_decimal.toString()),
                    type: "token"
                }
            }
        }
    };
}
  
async function syncswap(item) {
    const pool_interface = new ethers.Contract(item.address, syncswap_pool_abi, wallet);
    const pool_token0 = await pool_interface.token0();
    const token0_interface = new ethers.Contract(pool_token0, filePath_erc20, wallet);
    const token0_name = await token0_interface.name();
    const token0_symbol = await token0_interface.symbol();
    const token0_decimal = await token0_interface.decimals();
    const pool_token1 = await pool_interface.token1();
    const token1_interface = new ethers.Contract(pool_token1, filePath_erc20, wallet);
    const token1_name = await token1_interface.name();
    const token1_symbol = await token1_interface.symbol();
    const token1_decimal = await token1_interface.decimals();
    const pool_reserves = await pool_interface.getReserves();
    const pool_reserves_0 = (pool_reserves[0] / (10**token0_decimal)).toString()
    const pool_reserves_1 = (pool_reserves[1] / (10**token1_decimal)).toString()

    return {
        id: "Syncswap-"+item.address,
        type: "pool",
        attributes: {
            address: item.address,
            name: token0_symbol + " / " + token1_symbol,
            base_token_price_quote_token: pool_reserves_1 / pool_reserves_0,
            quote_token_price_base_token: pool_reserves_0 / pool_reserves_1,
            swap_fee: "0.3"
        },
        relationships: {
            dex: {
                data: {
                    id: "Syncswap",
                    type: "dex"
                }
            },
            base_token: {
                data: {
                    name: token0_name,
                    symbol: token0_symbol,
                    reserves: Number(pool_reserves_0),
                    contract_address: pool_token0,
                    decimals: Number(token0_decimal.toString()),
                    type: "token"
                }
            },
            quote_token: {
                data: {
                    name: token1_name,
                    symbol: token1_symbol,
                    reserves: Number(pool_reserves_1),
                    contract_address: pool_token1,
                    decimals: Number(token1_decimal.toString()),
                    type: "token"
                }
            }
        }
    };
}

main();