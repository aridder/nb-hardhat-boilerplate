import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { CBToken } from "../typechain";

const NOK_ADDRESS = process.env.NOK_ADDRESS;
const me = process.env.ME_ADDRESS;
const whale = process.env.WHALE_ADDRESS;

if (!NOK_ADDRESS || !me || !whale) {
  throw new Error("Missing env variables");
}

describe("CBContract", function () {
  let cbToken: CBToken;
  before(async function () {
    cbToken = await ethers.getContractAt(
      "contracts/CBContract.sol:CBToken",
      NOK_ADDRESS!
    );
  });
  describe("Balance", () => {
    it("should return the balance of the account", async () => {
      const balance2 = await cbToken.balanceOf(whale);
      console.log(balance2.toString());

      // need to change the variable of "me" before printing the balance
      // const balance = await cbToken.balanceOf(me);
      // console.log(balance.toString());
    });
  });

  describe("Transfer", () => {
    let whaleSigner: SignerWithAddress;
    before(async () => {
      whaleSigner = await ethers.provider.getSigner(whale);
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [whale],
      });
    });
    it("should transfer tokens", async () => {
      const balanceBefore = await cbToken.balanceOf(whale);
      console.log("Balnce in ether", ethers.utils.formatEther(balanceBefore));
      console.log(balanceBefore.toString());

      const tx = await cbToken.connect(whaleSigner).transfer(me, 1);
      await tx.wait();
      const balance = await cbToken.balanceOf(whale);
      console.log(balance.toString());
    });
  });
});
