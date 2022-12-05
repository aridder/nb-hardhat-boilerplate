import { expect } from "chai";
import { getDeployedContract, setupCBContract } from "./test-utils";

describe("TokenLock", async () => {
  describe("Inner thing", () => {
    it("should revert with NotSupported() if one the unsupported ERC-20 functions is called", async () => {
      const tokenLock = await getDeployedContract("TokenLock");
      const { config } = await setupCBContract();

      await expect(
        tokenLock.allowance(config.ME_ADDRESS, config.ME_ADDRESS)
      ).to.be.rejectedWith("NotSupported()");
      await expect(
        tokenLock.approve(config.ME_ADDRESS, 1000)
      ).to.be.rejectedWith("NotSupported()");
      await expect(
        tokenLock.transfer(config.ME_ADDRESS, 100)
      ).to.be.rejectedWith("NotSupported()");
      await expect(
        tokenLock.transferFrom(config.ME_ADDRESS, config.ME_ADDRESS, 100)
      ).to.be.rejectedWith("NotSupported()");
    });

    it("sets the owner and stores the provided arguments", async () => {
      const { contract: cbContract } = await setupCBContract();
      const tokenLock = await getDeployedContract("TokenLock");

      expect(await tokenLock.token()).to.equal(cbContract.address);
      expect(await tokenLock.lockDuration()).to.equal(0);
      expect(await tokenLock.name()).to.equal("MyLock");
      expect(await tokenLock.symbol()).to.equal("ML");
    });

    it("emits a Transfer event", async () => {
      const { config, contract: cbContract } = await setupCBContract();
      const tokenLockContract = await getDeployedContract("TokenLock");

      await cbContract
        .connect(config.ME_ADDRESS)
        .approve(tokenLockContract.address, 10);

      await expect(tokenLockContract.connect(config.ME_ADDRESS).deposit(10))
        .to.emit(tokenLockContract, "Transfer")
        .withArgs(config.ME_ADDRESS, tokenLockContract.address, 10);
    });
  });
});
