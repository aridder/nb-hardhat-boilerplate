import { TokenLock } from "./../typechain/TokenLock.d";
import { CBToken } from "./../typechain/CBToken.d";
import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const NOK_ADDRESS = process.env.NOK_ADDRESS;
const me = process.env.ME_ADDRESS;
const whale = process.env.WHALE_ADDRESS;

if (!NOK_ADDRESS || !me || !whale) {
  throw new Error("Missing env variables");
}

describe("TokenLock", async () => {
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  const now = Math.round(Date.now() / 1000);
  const oneWeek = 7 * 24 * 60 * 60;

  let whaleSigner: SignerWithAddress;
  let tokenLock: TokenLock;
  let nokToken: CBToken;

  before(async function () {
    const [first, second] = await ethers.getSigners();
    owner = first;
    user = second;

    whaleSigner = await ethers.provider.getSigner(whale);
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whale],
    });

    nokToken = await ethers.getContractAt(
      "contracts/CBContract.sol:CBToken",
      NOK_ADDRESS
    );

    const transferTX = await nokToken
      .connect(whaleSigner)
      .transfer(user.address, 100);
    await transferTX.wait();

    // tokenLock = await ethers.getContractFactory("TokenLock");
    await deployments.fixture("TokenLock");
    const tokenLockDeployment = await deployments.get("TokenLock");

    tokenLock = await ethers.getContractAt(
      tokenLockDeployment.abi,
      tokenLockDeployment.address
    );
    nokToken.connect(user).approve(tokenLock.address, 100);
  });

  it("should revert with NotSupported() if one the unsupported ERC-20 functions is called", async () => {
    await expect(
      tokenLock.allowance(user.address, user.address)
    ).to.be.rejectedWith("NotSupported()");
    await expect(tokenLock.approve(user.address, 1000)).to.be.rejectedWith(
      "NotSupported()"
    );
    await expect(tokenLock.transfer(user.address, 100)).to.be.rejectedWith(
      "NotSupported()"
    );
    await expect(
      tokenLock.transferFrom(user.address, user.address, 100)
    ).to.be.rejectedWith("NotSupported()");
  });

  it("sets the owner and stores the provided arguments", async () => {
    expect(await tokenLock.token()).to.equal(nokToken.address);
    expect(await tokenLock.lockDuration()).to.equal(0);
    expect(await tokenLock.name()).to.equal("MyLock");
    expect(await tokenLock.symbol()).to.equal("ML");
  });

  it("emits a Transfer event", async () => {
    await nokToken.connect(user).approve(tokenLock.address, 10);

    await expect(tokenLock.connect(user).deposit(10))
      .to.emit(tokenLock, "Transfer")
      .withArgs(user.address, tokenLock.address, 10);
  });
});
