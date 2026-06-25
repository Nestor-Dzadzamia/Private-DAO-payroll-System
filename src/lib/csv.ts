import { PayrollEntry } from "@/types/payroll";

export type SkippedRow = { line: string; reason: string };
export type ParseCSVResult = { entries: PayrollEntry[]; skipped: SkippedRow[] };

export function parseCSV(text: string): ParseCSVResult {
  const lines = text.trim().split("\n");
  const entries: PayrollEntry[] = [];
  const skipped: SkippedRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const parts = trimmed.split(",").map((p) => p.trim());
    if (parts.length < 3) {
      skipped.push({ line: trimmed, reason: "Expected 3 columns: name, address, amount" });
      continue;
    }

    const [name, address, amount] = parts;
    if (!name || !address || !amount) {
      skipped.push({ line: trimmed, reason: "Missing name, address, or amount" });
      continue;
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      skipped.push({ line: trimmed, reason: `Invalid wallet address: ${address}` });
      continue;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      skipped.push({ line: trimmed, reason: `Invalid amount: ${amount}` });
      continue;
    }

    entries.push({ name, address, amount });
  }

  return { entries, skipped };
}

export function generateSampleCSV(): string {
  return `# name, wallet_address, amount_usdc
Alice,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,1500
Bob,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,2200
Carol,0x90F79bf6EB2c4f870365E785982E1f101E93b906,800`;
}
