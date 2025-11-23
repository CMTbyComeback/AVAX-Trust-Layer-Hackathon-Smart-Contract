// Hardhat configuration for AVAX Trust Layer – Invariance Registry
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY || "";
const REPORT_GAS = process.env.REPORT_GAS === "true";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: 31337,
      hardfork: "istanbul",
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    fuji: {
      url: process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      gasPrice: 30000000000, // 30 gwei
      gasMultiplier: 1.1,
    },
    avalanche: {
      url: process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
      gasPrice: 25000000000,
      gasMultiplier: 1.1,
    },
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      metadata: {
        bytecodeHash: "ipfs",
      },
    },
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: SNOWTRACE_API_KEY,
      avalanche: SNOWTRACE_API_KEY,
    },
    customChains: [
      {
        network: "avalancheFujiTestnet",
        chainId: 43113,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
          browserURL: "https://testnet.snowtrace.io",
        },
      },
      {
        network: "avalanche",
        chainId: 43114,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan",
          browserURL: "https://snowtrace.io",
        },
      },
    ],
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: false,
  },
  coverage: {
    provider: "hardhat",
    reporter: ["text", "lcov", "html"],
    reporterOptions: {
      file: "coverage/coverage.json",
    },
    exclude: [
      "node_modules/",
      "test/",
    ],
  },
  mocha: {
    timeout: 200000,
    reporter: "spec",
    reporterOptions: {
      showDiff: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
