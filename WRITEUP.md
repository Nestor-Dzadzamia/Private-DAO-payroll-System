# Private DAO Payroll : Project Write-up

**Course:** Blockchain Technologies

**Privacy primitive:** Zero-Knowledge (ZK)

**Platform:** Hinkal Protocol (composing existing infrastructure)

**Live deployment:** [private-dao-payroll.vercel.app]

**Repository:** github.com/Nestor-Dzadzamia/Private-DAO-payroll-System

---

## The Problem

DAO treasuries pay contributors on-chain, which means every payment : who got paid, how much, and when : is permanently public. This exposes contributor compensation to competitors, attackers, and anyone watching the chain. A real organization cannot run payroll this way without leaking sensitive financial relationships.

## My approach

A Next.js web application where a DAO treasurer:
1. Uploads a CSV of contributors and amounts
2. Selects a token
3. Runs payroll with one click

The app calls Hinkal's `depositAndWithdraw()` function, which deposits the treasurer's funds into Hinkal's ZK shielded pool and pays out each contributor's address in the same logical operation, executed as separate on-chain transactions for the deposit and each payout.

This was tested with a real transaction on Polygon mainnet (not a testnet or simulation), moving real USDC between three of my own wallets, and independently verified on Polygonscan.

## Why ZK/Hinkal

The lecture material frames ZK as the right choice "if you can compute locally" and the prover holds the data : this fits payroll well: the treasurer already holds the full payment list locally (the CSV), and only needs to prove the resulting transaction is valid without revealing the link back to specific recipients.

I composed Hinkal rather than building circuits from scratch because:
- Hinkal ships an audited, mainnet-live shielded pool with a TypeScript SDK
- It explicitly lists "confidential payroll for DAOs" as a target use case
- Building a Groth16 circuit and verifier from scratch in the available time would not have produced a working, demoable mainnet application

**Trade-off:** I get a working product fast, but inherit Hinkal's trust assumptions instead of a trustless system I fully control (see Threat Model).

## Architecture

```
                 ┌─────────────────────┐
  Treasurer ───► │  depositAndWithdraw │ ───► Hinkal shielded pool contract
  (CSV upload)   │  (deposit + proof)  │      (deposit tx)
                 └─────────────────────┘
                                                    │
                                       (separate tx, same or later)
                                                    ▼
                                          Employee 1's address
                                          Employee 2's address
                                          Employee N's address
```

- **Frontend:** Next.js 16, wagmi v2, MetaMask connector
- **Privacy layer:** `@hinkal/common` SDK : ZK shielded pool, Groth16 proofs (snarkjs), proof construction in a secure enclave (`generateProofRemotely: true`, the SDK default)
- **Chain:** Polygon mainnet
- **No custom smart contract deployed** : I integrate with Hinkal's existing audited contracts and relayer infrastructure rather than deploying my own

### Data flow
1. Treasurer signs "Login to Hinkal Protocol" : derives a deterministic shielded keypair from the wallet signature
2. Treasurer uploads CSV → client validates addresses/amounts (`src/lib/csv.ts`, unit tested)
3. Treasurer calls `depositAndWithdraw(token, amounts[], addresses[])`
4. Hinkal's SDK constructs a ZK proof (remotely, in a secure enclave) proving the deposit is valid
5. The deposit transaction and each recipient's payout transaction are submitted on-chain as separate transactions
6. Recipients receive funds directly in their normal wallet : no claiming step required

## Threat Model : who can see what, who to trust

| Party | What they can see | Trust assumption |
|---|---|---|
| **Public / block explorer** | The treasurer's deposit transaction (amount, time) and each employee's incoming payout (amount, time) as **separate transactions**. Cannot prove a cryptographic link between a specific deposit and a specific payout without breaking the ZK proof. | None : this is the trustless part of the guarantee. |
| **Hinkal's backend / relayer** | Almost certainly sees the plaintext recipient addresses and amounts, since `depositAndWithdraw` takes them as plain arguments and Hinkal's infrastructure constructs the resulting on-chain transactions. Proof construction happens in a secure enclave (TEE) rather than a plain server, per Hinkal's own documentation. | I trust Hinkal's enclave/infrastructure not to log, leak, or sell this payment graph. This is the cost of composing existing infrastructure instead of running fully trustless, locally-proved cryptography. |
| **A sophisticated chain analyst** | Can attempt timing and amount correlation: if a $X deposit is followed shortly after by payouts summing to ~$X from the same pool address, with no other pool activity at that time, a confident probabilistic link can be inferred : without breaking any cryptography. | This is mitigated, not eliminated, by pool volume. Hinkal supports an optional `txCompletionTime` parameter to schedule payouts later rather than immediately, which I did not use in this demo (kept default/immediate for reliability). |
| **Competitors / the general public** | Cannot trivially see "Company X pays Contributor Y $Z" by reading the treasurer's transaction history, which was the original stated problem. | This is the property I actually deliver and verified myself on Polygonscan. |

### What I'm NOT claiming
I do not claim full anonymity from all possible adversaries. Specifically:
- Individual payout **amounts and addresses are publicly visible** on-chain : I do not hide that Employee 1 received 0.5 USDC from the Hinkal pool, only that I hide the *link* back to who funded it
- No protection against Hinkal's own infrastructure operator
- No protection against a well-resourced chain analyst doing timing/amount correlation against a low-volume pool

### A more private alternative I actually built and tested (and why it's not the primary flow)
Hinkal also supports `transfer()` (shielded-to-shielded transfer) followed by an independent, recipient-controlled `withdraw()` at a time and to an address of the recipient's choosing. This decouples the treasurer's deposit from the recipient's eventual cash-out in time, which would meaningfully strengthen unlinkability over my primary flow.

I did not just consider this, but implemented it as a separate path (`/treasurer/private`, `usePrivatePayroll.ts`), including a UI for employees to generate and share their "recipient info" code, a CSV format change (semicolon-delimited, since the recipient info string itself contains commas), and the full deposit-then-transfer flow.

**It does not currently work.** Every real-mainnet test (three different amounts, a manual sync delay, and an explicit call to `hinkal.resetMerkleTreesIfNecessary()`) failed with `INSUFFICIENT_FUNDS_TO_TRANSACT`. I traced this to its exact source in the SDK (`outputUtxoProcessing.mjs`: the function throws when its locally-known UTXO total is less than the requested transfer amount) and confirmed my balance was genuinely deposited and visible via `getBalances()` at the time of the failing call : so the SDK's internal accounting for this specific call path appears not to recognize a balance that the rest of the SDK does.

This is left in the repository, undeleted, as an honest record of the investigation. The primary, fully working, independently-verified flow is `depositAndWithdraw`.

## Failure Mode

**The anonymity set problem.** Privacy pools like Hinkal's rely on mixing many unrelated users' deposits and withdrawals together : the more activity in the pool, the harder it is to correlate any specific deposit with any specific withdrawal. In my testing, I was the only user of the pool at that moment. An attacker watching the pool's contract address could observe: "a deposit occurred, and within minutes, payouts of a similar total occurred from the same address" : and reasonably infer a link, purely through timing and amount correlation, without breaking any cryptography.

This is not a flaw unique to my implementation : it is a documented, known limitation of all privacy pools and mixers (including the much more decentralized Tornado Cash) when usage volume is low. The guarantee strengthens with adoption: a DAO running payroll through a heavily-used Hinkal pool, alongside hundreds of other unrelated transactions, gets meaningfully stronger privacy than my isolated test did.
