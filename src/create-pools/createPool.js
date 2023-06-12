const { ethers, BigNumber } = require('ethers');
const fs = require('fs');
const chalk = require('chalk');
const config = require('./config.js');
const path = require('path');
const filePath_contract = path.resolve(__dirname, '..', '..', './Addresses/contractAddresses.json');
const filePath_pool = path.resolve(__dirname, '..', '..', './Addresses/poolAddresses.json');

const provider = new ethers.providers.JsonRpcProvider(`https://zksync2-testnet.zksync.dev`);
const wallet_main = new ethers.Wallet(config.PRIVATE_KEY_MAIN, provider);
const wallet_2 = new ethers.Wallet(config.PRIVATE_KEY_2, provider);

const router_mute_interface = new ethers.Contract(config.muteio_router_contract_address, config.muteio_router_contract_abi, wallet_main);
const router_syncswap_interface = new ethers.Contract(config.syncswap_router_contract_address, config.syncswap_router_contract_abi, wallet_main);
const factory_syncswap_interface = new ethers.Contract(config.syncswap_factory_contract_address, config.syncswap_factory_contract_abi, wallet_2);

const tokenPairs = JSON.parse(fs.readFileSync(filePath_contract, "utf-8"));

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

// Function to get contract interface
function getContractInterface(tokenAddress, wallet) {
  return new ethers.Contract(tokenAddress, config.erc20_abi, wallet);
}

// Function to approve token
async function approveToken(contractInterface, routerContractAddress, amount) {
  const approval = await contractInterface.approve(routerContractAddress, amount);
  await approval.wait();
  console.log(`Token ${chalk.hex('#DEADED').bold(contractInterface.address)} has been approved...`);
}

// Function to convert to contract address
function convertToContractAddress(data) {
  if (data.startsWith("0x")) {
    data = data.slice(2);
  }
  return "0x" + data.slice(-40);
}

// Function to add liquidity for muteio
async function addLiquidity_for_muteio(addressA, addressB, amountA, amountB, decimalA, decimalB) {
    const tokenA = addressA;  // The address of token A
    const tokenB = addressB;  // The address of token B
    const amountADesired = ethers.utils.parseUnits(amountA, decimalA) ;  
    const amountBDesired = ethers.utils.parseUnits(amountB, decimalB) ;  
    const amountAMin = ethers.utils.parseUnits(amountA, decimalA) ;  
    const amountBMin = ethers.utils.parseUnits(amountB, decimalB) ;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;  
    const feeType = 150;  
    const stable = false;  
    
    const token0_contract_interface = getContractInterface(tokenA, wallet_main);
    const token1_contract_interface = getContractInterface(tokenB, wallet_main);
  
    await approveToken(token0_contract_interface, config.muteio_router_contract_address, amountADesired);
    await approveToken(token1_contract_interface, config.muteio_router_contract_address, amountBDesired);

    const tx = await router_mute_interface.addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      wallet_main.address,
      deadline,
      feeType,
      stable,
      {
        gasLimit: 3500000,
      }
    );
    console.log('Transaction has been sent, waiting for confirmation...');
    await tx.wait();

    const txReceipt = await provider.getTransactionReceipt(tx.hash);
    const logs = txReceipt.logs;
    console.log(`Transaction confirmed. Pool address: ${chalk.black.bgYellow(logs[logs.length -2]["address"])}`);
    return logs[logs.length -2]["address"];
}

// Function to add liquidity for syncswap
async function addLiquidity_for_syncswap(addressA, addressB, amountA, amountB, decimalA, decimalB) {
    let tokenA = addressA;  // The address of token A
    let tokenB = addressB;  // The address of token B
    let amountADesired = ethers.utils.parseUnits(amountA, decimalA) ;  
    let amountBDesired = ethers.utils.parseUnits(amountB, decimalB) ;  
    if (tokenB < tokenA) {
      [tokenA, tokenB] = [tokenB, tokenA];
      [amountADesired, amountBDesired] = [amountBDesired, amountADesired];
    }
    const token0_contract_interface = getContractInterface(tokenA, wallet_main);
    const token1_contract_interface = getContractInterface(tokenB, wallet_main);

    await approveToken(token0_contract_interface, config.syncswap_router_contract_address, amountADesired);
    await approveToken(token1_contract_interface, config.syncswap_router_contract_address, amountBDesired);
  
    const dataForLiquidity = ethers.utils.defaultAbiCoder.encode(['address'], [wallet_main.address]); //  
    const dataForcreatePool = ethers.utils.defaultAbiCoder.encode(['address', 'address'], [tokenA, tokenB]); // create pool
    console.log(chalk.yellow('Creating pool...'));
    const create_pool = await factory_syncswap_interface.createPool(dataForcreatePool);
    await create_pool.wait();

    const txReceipt = await provider.getTransactionReceipt(create_pool.hash);
    const logs = txReceipt.logs;
    const pool_contract_address = (logs[2]["topics"][logs[2]["topics"].length - 1]);
    const contractAddress = convertToContractAddress(pool_contract_address);
    console.log(`Pool address is: ${chalk.black.bgYellow(contractAddress)}`);

    const tokenInputArray = [
        {
            token: tokenA,
            amount: amountADesired
        },
        {
            token: tokenB,
            amount: amountBDesired
        },

    ];
    // const toplam = amountADesired.add(amountBDesired);
    // const islem = toplam.sub(toplam.mul(1).div(1000)).sub(1);

    const tx = await router_syncswap_interface.addLiquidity2(
        contractAddress,
        tokenInputArray,
        dataForLiquidity,
        BigInt(0),
        ethers.constants.AddressZero,
        '0x',
        {
            gasLimit: 3500000,
        }
    );

    await tx.wait();
    console.log(chalk.green('Transaction successful...'));
    return contractAddress;
}

// Main function
async function addLiquidityForPairs() {
  const poolAddresses = [];
  for (let i = 1; i < tokenPairs.length; i++) {
      const pair_weth = tokenPairs[0];
      const pair_token = tokenPairs[i];
      const pair_amounts_weth = token_amounts_muteio[0];
      const pair_amounts_token = token_amounts_muteio[i];
      const poolAddressMuteio = await addLiquidity_for_muteio(pair_token._address, pair_weth._address, pair_amounts_token, pair_amounts_weth, pair_token._decimals, pair_weth._decimals);
      poolAddresses.push({pool: `Muteio - ${pair_weth._symbol} / ${pair_token._symbol}`, token0: pair_token._address, token1: pair_weth._address, address: poolAddressMuteio});
  }
  console.log(chalk.yellow('Liquidity has been added to all pools in Muteio'));
  for (let i = 1; i < tokenPairs.length; i++) {
    const pair_weth = tokenPairs[0];
    const pair_token = tokenPairs[i];
    const pair_amounts_weth = token_amounts_syncswap[0];
    const pair_amounts_token = token_amounts_syncswap[i];
    const poolAddressSyncswap = await addLiquidity_for_syncswap(pair_token._address, pair_weth._address, pair_amounts_token, pair_amounts_weth, pair_token._decimals, pair_weth._decimals);
    poolAddresses.push({pool: `Syncswap - ${pair_weth._symbol} / ${pair_token._symbol}`, token0: pair_token._address, token1: pair_weth._address, address: poolAddressSyncswap});
  }
  console.log(chalk.yellow('Liquidity has been added to all pools in Syncswap'));
  fs.writeFileSync(filePath_pool, JSON.stringify(poolAddresses, null, 2));
}

addLiquidityForPairs().catch(console.error);