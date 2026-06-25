# Private DAO Payroll

> Pay your DAO contributors privately on-chain. Competitors see nothing. Contributors get paid.

Built on [Hinkal Protocol](https://hinkal.pro) a ZK shielded pool for EVM chains.

## The Problem

Every on-chain payroll transaction is publicly visible on Etherscan. Anyone can see who your contributors are, how much they earn, and your organization's burn rate. This exposes sensitive data to competitors, attackers, and even your own team members.

## The Solution

Route payroll through Hinkal's ZK shielded pool:

```
DAO Treasury → Hinkal Pool (ZK proof) → Employee's shielded address
                     ↑
        Observers see one lump-sum deposit.
        No one sees individual salaries.
```

## Features

- **Upload CSV** : `name, 0x_address, amount` and you're ready
- **One-click payroll** : deposit + batch private transfers in sequence
- **Employee claim page** : withdraw to any fresh wallet, no link to employer
- **ZK proofs generated locally** : Hinkal's SDK handles Groth16 snarkjs under the hood
- **Compliance-ready** : viewing keys allow selective disclosure for audits

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- [@hinkal/common](https://www.npmjs.com/package/@hinkal/common) : ZK shielded pool SDK
- wagmi v2 + viem : wallet connection
- React Hot Toast : transaction notifications

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Add your WalletConnect project ID (free at https://cloud.walletconnect.com)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Treasurer (paying the team)

1. Connect MetaMask on the DAO's treasury wallet
2. Go to **Treasurer Dashboard**
3. Upload a CSV: `name, wallet_address, amount_usdc`
4. Select the token (USDC/USDT)
5. Click **Run Private Payroll**
   - Funds deposit into Hinkal's shielded pool
   - Each employee receives a private shielded transfer
   - On-chain: just one lump-sum deposit to Hinkal : nothing else visible

### Employee (claiming payment)

1. Connect the wallet your employer registered
2. Go to **Claim My Payment**
3. See your shielded balance
4. Enter a fresh wallet address (for maximum privacy)
5. Click **Withdraw Privately** : ZK proof generated locally, funds arrive with no on-chain link to the DAO

## Privacy Model

| Observer | Sees |
|---|---|
| Public (Etherscan) | DAO sent X total USDC to Hinkal contract |
| Hinkal contract | Encrypted notes : amounts and addresses hidden |
| Employee | Their own balance only (via private key) |
| Treasurer | Full payroll history (local state) |
| Auditor | Selective disclosure via Hinkal viewing keys |

## Architecture

```
src/
  app/
    page.tsx          : Landing / wallet connect
    treasurer/        : Payroll dashboard
    employee/         : Claim / withdraw
  components/
    payroll/          : CSVUpload, PayrollTable, TokenSelector
    ui/               : Button, Badge, Spinner
  hooks/
    usePayroll.ts     : Deposit + batch transfer logic
    useWithdraw.ts    : ZK withdrawal flow
  context/
    HinkalContext.tsx : Hinkal SDK instance + balances
  lib/
    csv.ts            : CSV parsing
    wagmi.config.ts   : Wallet config
```

## License

MIT
