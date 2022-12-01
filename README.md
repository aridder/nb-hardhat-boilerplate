# Norges Bank - Hardhat Boilerplate

The tests are with these configuration makes "a copy" of the external blockchain from the RPC_URL provided. These lets you play with the current state in your tests.

Create a `.env.local` file from the `.env.example`. You need a RPC-url with basic authentication and address for NOK(CBToken) contract and your own token. Those are used in the tests

`./contracts` contains CBContract.sol which is the actual contract for NOK token.

Run the test for NOK (which is deployed already) and TokenLock which we deploy automatically before tests are run
```
npx hardhat test
```

### Impersonate accounts
This is a useful tool if you want to impersonate another address on the network. We do this `CBToken.spec.ts` and `TokenLock.spec.ts` Let's say you want to transfer tokens from someone or call functions on contracts that are only callable by certain addresses

For deploying contracts, building typescript interfaces to the network please read more in the [Hardhat documentation](https://hardhat.org/docs)