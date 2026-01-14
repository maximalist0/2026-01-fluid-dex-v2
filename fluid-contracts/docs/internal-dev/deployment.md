## Fluid Deployment Guide

Fluid deployment is split into multiple phases:

- Phase 1: core contracts deployment. Avocado Multisig is owner (= UUPS proxyAdmin) everywhere (Governance)
- Phase 2: core contracts initial configs (via Avocado Multisig)
- Phase 3: Dex contracts
- Phase 4 (ongoing phase): list tokens, add vaults (via Avocado Multisig)
- External: Non-Standard ongoing maintenance will be executed directly via the Avocado transaction builder (e.g. changing config values etc.)

Phase 1 deploys:

- Liquidity
- Vault protocol core contracts
- Lending protocol core contracts
- StETH protocol

Phase 2 sets up initial configs for all of the above.

Phase 3 deploy and initialize Dex:

- DexFactory
- Dex core contracts
- Dex resolvers etc.

Phase 4, List token sets up:

- RateConfig, TokenConfig at Liquidity
- Deploy fToken and set up supplyConfig at Liquidity (optional with LendingRewardsRateModel)

Phase 4, Add vault sets up:

- Oracle
- Vault deployment
- supply / borrow config at Liquidity for the vault
- set core vault settings

### Use

1. Set config in .env file
2. Configure config files for the deployment in `./scripts/settings/`
3. Execute the command for the phase you want to execute

#### Do not delete config files

Rename them instead and push them so we can easily track what configs were used. E.g. listing USDC as token on Mainnet:

- First set up the config in list-token-configs.ts and execute
- Rename file to list-token-configs.log-mainnet-USDC.ts

#### Available scripts

Phase 1 (config in `./scripts/settings/core-configs`):

```
npx hardhat run scripts/prod-core-deploy.ts --network <network>
```

Phase 2 (config in `./scripts/settings/core-configs`):

```
npx hardhat run scripts/prod-core-configs.ts --network <network>
```

Phase 3:

Todo

Phase 4 / Ongoing:

See scripts in `./scripts/prod/`. E.g.:

- List a new token (config in `./scripts/settings/list-token-configs`):

```
npx hardhat run scripts/prod-list-token.ts --network <network>
```

- Add a vault (config in `./scripts/settings/add-vault-configs`):

```
npx hardhat run scripts/prod-add-vault.ts --network <network>
```

#### Adjust if needed

Implementing all sorts of cases that can be needed for a deployment would be too complex. If there are specific cases to solve, it's best to look into the code directly and comment out steps that should be skipped.

#### Using the generated Avocado batch.json file

All commands that require execution through the owner / proxyAdmin generate calldata to be executed via the Avocado Multisig.
The generated batch json file is output in `./txs-batches` and can be imported and executed via the Avocado transaction builder.

Note: Executing is expensive! Initial core configs is ~12M gas, listing a token is ~ 4.5M gas, adding a vault ~5M gas.

#### List token / Add vault includes manual work!

Log files for those deployments are created when the calldata (batch.json) file is built, but execution happens afterwards through the Avocado Multisig governance.
Manually set the transaction hash in the log files for those processes.

If something goes wrong for listing a token / adding a vault during execution, and the process has to be restarted, MANUALLY DELETE THE PREVIOUS LOG FILES!

**Every new fToken / vault should be seeded with an initial deposit that is never withdrawn!**

## Multichain deployments

Before any deployment on networks other than Ethereum mainnet, make sure to make necessary adjustments to the contracts. E.g. check for Oracles stale data / Sequencer on L2 etc. https://docs.chain.link/data-feeds/l2-sequencer-feeds#example-code

### How to deploy on a new chain

In `/scripts` folder:

Guide to deploy Fluid on a new chain:

    ---- STEP 1: core contracts Liquidity Proxy, Factories -------

1.  check out branch "new-chain-deploy-core-frozen" `git checkout new-chain-deploy-core-frozen`
2.  set up hardhat-config.ts for the new chain
3.  ensure governance address is as expected in `core-configs.ts` (changing will lead to different contract addresses). Likely never needed.
4.  execute new-chain-deploy script: `npx hardhat run scripts/new-chain-deploy.ts --network <network>`
5.  create commit on branch "new-chain-deploy-core-frozen" and push
6.  check out master branch, create a new branch for new chain deployment, e.g. "feature/deploy-arb"
7.  cherry pick the commit created on "new-chain-deploy-core-frozen"

    ---- STEP 2: all contracts for Vault Protocol, fTokens etc. incl. resolvers but without DEX -------

8.  continue with rest of deployment:
    set all configs in core-configs.ts and periphery-configs.ts
    (consider things such as owner for Liquidator contract might be Team Multisig on new chains!)
9.  execute new-chain-deploy and new-chain-initial-config scripts:
    - `npx hardhat run scripts/new-chain-deploy.ts --network <network>`
    - `npx hardhat run scripts/new-chain-initial-configs.ts --network <network>`
10. give deployment allowance at DeployerFactory for deployer address for oracles

    ---- STEP 3: DEX and smart vault, smart lending related contracts -------
    (dex resolvers are needed for easy backend integration)

11. check out branch "new-chain-deploy-dex-factory-frozen" & cherry-pick first commit on new deployment branch where you added the hardhat config for the new network
12. deploy dex factory with `npx hardhat run scripts/new-chain-deploy.ts --network <network>` & create commit
13. check out new deployment branch again and cherry pick the created commit for dex factory

14. check out branch "new-chain-deploy-smart-lending-factory-frozen" & cherry-pick the new commits on the dex factory frozen branch, to get hardhat config + DexFactory logs and the commit with deploying the core contracts from the `new-chain-deploy-frozen` branch to get the Liquidity Layer logs.
15. deploy smart lending factory with `npx hardhat run scripts/new-chain-deploy.ts --network <network>` & create commit
16. check out new deployment branch again and cherry pick the created commit for smart lending factory

17. deploy rest of Dex & SmartLending by executing `npx hardhat run scripts/new-chain-deploy-dex.ts --network <network>` (deployment logic for Dex and smart vaults is included by default, if NOT needed, make sure to comment code out, check the script)

18. optional if needed: set deployment logics at factories, set SmartLending creation code at factory:

    - check prod-initial-configs.ts for config core smart lending, check what to comment in/out
    - queue txs for setting auth / deployer at factories manually from team MS if any needed
    - set dex deployment logic T1 at DexFactory and smart vault deployment logics at VaultFactory: queue manually via team MS

19. Consider if anything else is needed like config handlers, withdraw limit handlers etc.
