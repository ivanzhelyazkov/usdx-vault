require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('hardhat-contract-sizer');
require('solidity-coverage');
// require('hardhat-gas-reporter');
require('dotenv').config();

const alchemy = {
  mainnet: 'https://eth-mainnet.alchemyapi.io/v2/',
  arbitrum: 'https://arb-mainnet.g.alchemy.com/v2/',
  optimism: 'https://opt-mainnet.g.alchemy.com/v2/',
  polygon: 'https://polygon-mainnet.g.alchemy.com/v2/',
  goerli: 'https://eth-goerli.alchemyapi.io/v2/'
}

const key = process.env.ALCHEMY_KEY;
// if(!key) {
//   console.log('please set your ALCHEMY_KEY in .env');
//   process.exit(1);
// }

module.exports = {
  networks: {
    hardhat: {
			// forking: {
			// 	url: alchemy.mainnet + key,
      //   enabled: false,
      //   blockNumber: 15478043
			// },
      initialBaseFeePerGas: 0
    },
    // mainnet: {
    //   url: alchemy.mainnet + key,
    //   accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    //   gasPrice: 50000000000,
    //   gas: 8888888
    // },
    // goerli: {
    //   url: alchemy.goerli + key,
    //   accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    //   //gasPrice: 1100000000,
    //   gas: 7777777
    // }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    version: '0.8.16',
    settings: {
      optimizer: {
        enabled: true,
        runs: 7777,
      }
    }
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
  }
}
