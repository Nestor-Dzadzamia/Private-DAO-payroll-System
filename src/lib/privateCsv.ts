import { PrivatePayrollEntry } from "@/types/privatePayroll";

export type SkippedRow = { line: string; reason: string };
export type ParsePrivateCSVResult = {
  entries: PrivatePayrollEntry[];
  skipped: SkippedRow[];
};

// Recipient info is itself a comma-separated string (randomization,stealthAddress,
// encryptionKey,H0,H1), so this format uses ";" as the column delimiter instead of ",".
function isValidRecipientInfo(value: string): boolean {
  const parts = value.split(",").map((p) => p.trim());
  if (parts.length !== 5) return false;
  return parts.every((p) => p.length > 0);
}

export function parsePrivateCSV(text: string): ParsePrivateCSVResult {
  const lines = text.trim().split("\n");
  const entries: PrivatePayrollEntry[] = [];
  const skipped: SkippedRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const parts = trimmed.split(";").map((p) => p.trim());
    if (parts.length < 3) {
      skipped.push({ line: trimmed, reason: "Expected 3 columns separated by ';': name;recipientInfo;amount" });
      continue;
    }

    const [name, recipientInfo, amount] = parts;
    if (!name || !recipientInfo || !amount) {
      skipped.push({ line: trimmed, reason: "Missing name, recipient info, or amount" });
      continue;
    }
    if (!isValidRecipientInfo(recipientInfo)) {
      skipped.push({ line: trimmed, reason: "Invalid recipient info — expected 5 comma-separated values from the employee's Claim page" });
      continue;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      skipped.push({ line: trimmed, reason: `Invalid amount: ${amount}` });
      continue;
    }

    entries.push({ name, recipientInfo, amount });
  }

  return { entries, skipped };
}

export function generatePrivateSampleCSV(): string {
  return `# name;recipientInfo;amount_usdc
# Paste the recipient info each employee copied from their Claim page
Alice;PASTE_EMPLOYEE_RECIPIENT_INFO_HERE;0.5
Bob;PASTE_EMPLOYEE_RECIPIENT_INFO_HERE;0.5`;
}
