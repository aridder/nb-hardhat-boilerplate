import { Contract } from "ethers";
import { ethers, network } from "hardhat";

const _getEtherConfig = () => {
  const { NOK_ADDRESS, ME_ADDRESS, WHALE_ADDRESS } = process.env;

  if (!NOK_ADDRESS || !ME_ADDRESS || !WHALE_ADDRESS) {
    throw new Error("Missing env variables");
  }

  return { NOK_ADDRESS, ME_ADDRESS, WHALE_ADDRESS };
};

const _transfer =
  (contract: Contract) =>
  async (options: { amount: number; sender: string; receiver: string }) => {
    const signer = ethers.provider.getSigner(options.sender);
    const tx = await contract
      .connect(signer)
      .transfer(options.receiver, options.amount);

    await tx.wait();
  };

const _getBalance =
  (contract: Contract) =>
  (...accounts: string[]): Promise<number[]> =>
    Promise.all(
      accounts
        .map((account) => contract.balanceOf(account))
        .map(async (balance) => (await balance).toNumber())
    );

type ContractPath = `contracts/${string}.sol:${string}`;
export const generateUtils = async (contractPath: ContractPath) => {
  const config = _getEtherConfig();

  // setting up local blockchain stuff
  const contract = await ethers.getContractAt(
    contractPath,
    config.NOK_ADDRESS!
  );

  await impersonate(config.ME_ADDRESS, config.WHALE_ADDRESS);

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [config.ME_ADDRESS],
  });

  // generating helper methods
  const transfer = _transfer(contract);
  const getBalance = _getBalance(contract);
  return { config, transfer, getBalance };
};
const impersonate = (...accounts: string[]) =>
  Promise.all(
    accounts.map((account) =>
      network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account],
      })
    )
  );