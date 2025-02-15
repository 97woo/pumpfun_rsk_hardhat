require('dotenv').config()
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    rskTestnet: {
    url: process.env.RSK_TESTNET_RPC_URL || "https://public-node.testnet.rsk.co",
    chainId: 31,
    accounts: [process.env.PRIVATE_KEY]
  },
    hardhat: {
      forking: {
        url: process.env.RSK_TESTNET_RPC_URL
      },
      chainId: 3131,
    }
  }
};
