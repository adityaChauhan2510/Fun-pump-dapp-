// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

// This includes instruction for deployment

const FEE = ethers.parseUnits("0.01", 18);

module.exports = buildModule("FactoryModule", (m) => {
  // Get parameters
  const fee = m.getParameter("fee", FEE);

  // Deploy contract
  const factory = m.contract("Factory", [fee]);

  // Return contract
  return { factory };
});
