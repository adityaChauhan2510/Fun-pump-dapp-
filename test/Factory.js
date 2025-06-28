const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  const FEE = ethers.parseEther("0.0001", 18);
  async function deployFactoryFixture() {
    const [deployer, creator] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Factory"); //Fetch the contract

    const factory = await Factory.deploy(FEE); //deploy the contract

    //create token
    const transaction = await factory
      .connect(creator)
      .create("ADITYA", "ADI", { value: FEE });
    await transaction.wait();

    //get token
    const tokenAddress = await factory.tokens(0);
    const token = await ethers.getContractAt("Token", tokenAddress);

    return { factory, deployer, token, creator };
  }

  describe("Deployment", function () {
    it("Should set the fee", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      expect(await factory.fee()).to.equal(FEE);
    });

    it("Should set the owner", async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture);
      expect(await factory.owner()).to.equal(deployer.address);
    });
  });

  describe("Creating tokens", function () {
    it("should set the owner", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture);
      expect(await token.owner()).to.equal(await factory.getAddress());
    });

    it("should set the creater", async function () {
      const { token, creator } = await loadFixture(deployFactoryFixture);
      expect(await token.creator()).to.equal(creator.address);
    });

    it("should set the supply", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture);
      const supply = ethers.parseEther("100", 18);
      expect(await token.balanceOf(await factory.getAddress())).to.equal(
        supply
      );
    });

    it("should update ETH balance", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      const balance = await ethers.provider.getBalance(
        await factory.getAddress()
      );
      expect(balance).to.equal(FEE);
    });

    it("should create the token sale", async function () {
      const { factory, token, creator } = await loadFixture(
        deployFactoryFixture
      );
      const count = await factory.totalTokens();

      expect(count).to.equal(1);

      const sale = await factory.getTokenSale(0);
      //console.log(sale);
      expect(sale.token).to.equal(await token.getAddress());
      expect(sale.creator).to.equal(creator.address);
      expect(sale.sold).to.equal(0);
      expect(sale.raised).to.equal(0);
      expect(sale.isOpen).to.equal(true);
    });
  });
});
