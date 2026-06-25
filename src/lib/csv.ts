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
Employee1,0x6159D30C697dA707c83be456c114366EE2681A92,0.1
Employee2,0x87Ab970115c4eD2b76B828927c26cd7c14b8C3f7,0.1`;
}
