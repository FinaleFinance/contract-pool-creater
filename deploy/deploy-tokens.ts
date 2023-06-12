import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import chalk from "chalk";
import fs from "fs";

// load env file
import path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '..', '.env') });
const filePath = path.resolve(__dirname, '..', './Addresses/contractAddresses.json');

// load wallet private key from env file
const PRIVATE_KEY = process.env.PRIVATE_KEY_MAIN || "";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  
  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);
  
  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("ERC20");
  
  const tokens = [
    { _name: "Wrapped Ether", _symbol: "WETH", _decimals: 18, _initialSupply: ethers.utils.parseUnits('10000000000000', 18) },
    { _name: "USD Coin", _symbol: "USDC", _decimals: 6, _initialSupply: ethers.utils.parseUnits('10000000000000', 6) },
    { _name: "Wrapped Bitcoin", _symbol: "WBTC", _decimals: 8, _initialSupply: ethers.utils.parseUnits('10000000000000', 8) },
    { _name: "Dai Stablecoin", _symbol: "DAI", _decimals: 18, _initialSupply: ethers.utils.parseUnits('10000000000000', 18) },
    { _name: "Tether USD", _symbol: "USDT", _decimals: 6, _initialSupply: ethers.utils.parseUnits('10000000000000', 6) },
    { _name: "SHIBA INU", _symbol: "SHIB", _decimals: 18, _initialSupply: ethers.utils.parseUnits('10000000000000', 18) },
    { _name: "ChainLink Token", _symbol: "LINK", _decimals: 18, _initialSupply: ethers.utils.parseUnits('10000000000000', 18) },
    { _name: "Finale Token", _symbol: "ALE", _decimals: 18, _initialSupply: ethers.utils.parseUnits('10000000000000', 18) },
  ];
  
  const contractAddresses: { _name: string, _symbol: string, _decimals: number, _initialSupply: string, _address: string }[] = [];

  for (const token of tokens) {
    const { _name, _symbol, _decimals, _initialSupply } = token;
    
    // Estimate contract deployment fee
    const deploymentFee = await deployer.estimateDeployFee(artifact, [_name, _symbol, _decimals, _initialSupply]);
    const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
    console.log(`The deployment of ${chalk.yellow(_name)} token is estimated to cost ${chalk.green(parsedFee)} ETH`);

    const tokenContract = await deployer.deploy(artifact, [_name, _symbol, _decimals, _initialSupply]);

    const contractAddress = tokenContract.address;
    console.log(`${chalk.yellow(artifact.contractName)} for ${chalk.yellow(_name)} token was deployed to ${chalk.blue(contractAddress)}`);
    try {
        await hre.run("verify:verify", {
          address: contractAddress,
          contract: "contracts/ERC20Token.sol:ERC20",
          constructorArguments: [_name, _symbol, _decimals, _initialSupply]
        });
      } catch {}

    contractAddresses.push({
        _name,
        _symbol,
        _decimals,
        _initialSupply:_initialSupply.toString(),
        _address: contractAddress
      });

    console.log("--------------------------------------------");
  }
  fs.writeFileSync(filePath, JSON.stringify(contractAddresses, null, 2));
}