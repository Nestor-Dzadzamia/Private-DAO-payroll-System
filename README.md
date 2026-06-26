# Private DAO Payroll

> Pay your DAO contributors on-chain without exposing the link between your treasury and each contributor.

Built on [Hinkal Protocol](https://hinkal.io), a ZK shielded pool for EVM chains.

## The Problem

Every on-chain payroll transaction is publicly visible. Anyone can see your treasury address, your contributors' addresses, and exactly how much each one was paid. This exposes sensitive compensation data to competitors, attackers, and the public.

## The Solution

Route payroll through Hinkal's ZK shielded pool:

```
DAO Treasury --(deposit + ZK proof)--> Hinkal Pool --(separate tx)--> Employee's address
```

The treasurer's deposit and each employee's payout are **separate on-chain transactions** with no shared transaction hash or direct transfer between them. An outside observer sees "Treasury paid the Hinkal pool" and, separately, "Employee received funds from the Hinkal pool" — but cannot cryptographically prove these are linked.

**What this does NOT hide:** individual payout amounts and employee addresses are visible on-chain (this is a direct-settlement design, not a fully shielded one — see Privacy Model below). What it hides is the on-chain link between a specific treasury and a specific employee's payment.

This app does not deploy any custom smart contract. It integrates entirely with Hinkal's existing, audited, mainnet-deployed contracts and relayer infrastructure.

## Features

- **Upload CSV**: `name, 0x_address, amount` and you're ready
- **One-click payroll**: deposit and pay every contributor in a single transaction via Hinkal's `depositAndWithdraw`
- **Claim page**: a general-purpose tool to withdraw any Hinkal shielded balance to any address, with a ZK proof proving ownership
- **Disconnect**: switch wallets/accounts without a page refresh

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- [@hinkal/common](https://www.npmjs.com/package/@hinkal/common) — ZK shielded pool SDK (v0.2.37)
- wagmi v2 + viem — wallet connection
- Vitest — unit tests
- React Hot Toast — transaction notifications

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running tests

```bash
npm run test
```

Covers CSV parsing and validation logic (`src/lib/csv.test.ts`, `src/lib/privateCsv.test.ts`) — the privacy-adjacent logic that lives in our own code, as opposed to the cryptographic core, which is Hinkal's audited, external SDK.

## Usage

### Treasurer (paying the team)

1. Connect MetaMask on the DAO's treasury wallet
2. Sign the "Login to Hinkal Protocol" message to derive your shielded keys
3. Go to **Treasurer Dashboard**
4. Upload a CSV: `name, wallet_address, amount_usdc`
5. Select the token
6. Click **Run Private Payroll**
   - This calls `hinkal.depositAndWithdraw()`: funds are deposited into the shielded pool and paid out to each recipient's address in one logical operation, executed as separate on-chain transactions
   - Recipients receive funds directly in their normal wallet — no claiming step required

This flow was tested end-to-end with real transactions on **Polygon mainnet** and independently verified on Polygonscan (see Privacy Model below). The wallet config also includes Arbitrum, Base, Optimism, and Ethereum mainnet, since Hinkal's SDK supports them — but only Polygon has been tested by us with real funds.

### Claim page (general utility)

A separate page for withdrawing any shielded balance you hold to any address, generating a ZK proof of ownership. Useful for recovering funds sent via a shielded transfer, or for testing.

## Privacy Model — what's actually hidden, and from whom

| Observer | What they can see |
|---|---|
| Public (block explorer) | The treasury's deposit transaction and each recipient's payout transaction — as separate, unlinked-looking transactions. Cannot prove which deposit funded which payout without breaking the ZK proof. |
| Hinkal's relayer/backend | Likely sees the plaintext recipient addresses and amounts, since it constructs the on-chain withdrawal transactions on the treasurer's behalf. **We trust Hinkal's infrastructure not to leak or correlate this data** — this is a real trust assumption, not a cryptographic guarantee. |
| A sophisticated chain analyst | Could attempt timing/amount correlation (e.g. "a $X deposit happened, and within minutes, payouts totaling ~$X came out") — a known limitation of low-volume pool usage. Privacy strengthens as more unrelated users transact through the same pool. |

**Independently verified, not just claimed:** we traced real transactions on Polygonscan and confirmed the treasurer's deposit transaction never references either employee's address, and each employee's payout transaction never references the treasurer's address — both only ever touch Hinkal's own pool contract (`0x25e5e82f5702A27C3466fE68f14abDbbAdFca826`, confirmed against Hinkal's own published deployment data) and relayer.

**Honest summary:** this design hides the on-chain *link* between payer and payee from public observers. It does not hide individual amounts/addresses from on-chain analysis, and it does not hide the payment graph from Hinkal's own infrastructure. ZK proofs in this app are generated by Hinkal's backend (`generateProofRemotely: true`, the SDK default), not in the browser.

## Experimental: maximum-privacy mode (not used in the verified demo)

`/treasurer/private` is an additional, separate path we built to test a stronger-privacy alternative: shielded-to-shielded transfers (`hinkal.transfer()`) instead of direct settlement, so the employee's payout is decoupled in time from the treasurer's deposit rather than happening in the same flow.

**This path does not currently work.** Every real-fund test attempt failed with an "insufficient funds" error from Hinkal's SDK despite adequate balance, across multiple amounts and a diagnosed merkle-tree sync fix. We traced the failure to its exact line in the SDK source but could not resolve it within the project timeline. It is left in the repository as a documented, honest record of the investigation — **the primary, working, verified flow is `/treasurer`**, using `depositAndWithdraw`.

## Architecture

```
src/
  app/
    page.tsx              : Landing / wallet connect
    treasurer/
      page.tsx             : Treasurer Dashboard — primary, working payroll flow
      private/page.tsx     : Experimental shielded-transfer flow (not working, see above)
    employee/page.tsx      : Claim page — withdraw any shielded balance
  components/
    DisconnectButton.tsx   : Disconnects wallet + resets Hinkal session
    ConnectWallet.tsx       : Wallet connect + Hinkal login
    payroll/
      CSVUpload.tsx, PayrollTable.tsx, TokenSelector.tsx       : Primary flow components
      PrivateCSVUpload.tsx, PrivatePayrollTable.tsx            : Experimental flow components
    ui/                    : Button, Badge, Spinner
  hooks/
    usePayroll.ts          : hinkal.depositAndWithdraw() — primary flow
    usePrivatePayroll.ts   : hinkal.transfer() loop — experimental, not working
    useWithdraw.ts         : hinkal.withdraw() — shielded balance withdrawal to any address
  context/
    HinkalContext.tsx      : Hinkal SDK instance + balances
  lib/
    csv.ts / csv.test.ts                 : Primary CSV parsing + validation + tests
    privateCsv.ts / privateCsv.test.ts    : Experimental CSV parsing + tests
    wagmi.config.ts                       : Wallet config
```

## License

MIT
