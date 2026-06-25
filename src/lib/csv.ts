import { PayrollEntry } from "@/types/payroll";

export function parseCSV(text: string): PayrollEntry[] {
  const lines = text.trim().split("\n");
  const entries: PayrollEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const parts = trimmed.split(",").map((p) => p.trim());
    if (parts.length < 3) continue;

    const [name, address, amount] = parts;
    if (!name || !address || !amount) continue;
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) continue;
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) continue;

    entries.push({ name, address, amount });
  }

  return entries;
}

export function generateSampleCSV(): string {
  return `# name, wallet_address, amount_usdc
Alice,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,1500
Bob,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,2200
Carol,0x90F79bf6EB2c4f870365E785982E1f101E93b906,800`;
}
