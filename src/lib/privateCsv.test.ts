import { describe, it, expect } from "vitest";
import { parsePrivateCSV, generatePrivateSampleCSV } from "./privateCsv";

const VALID_RECIPIENT_INFO =
  "123456789,0xabc1234567890abcdef1234567890abcdef12345678,0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890123,111,222";

describe("parsePrivateCSV", () => {
  it("parses valid rows separated by semicolons", () => {
    const csv = `# name;recipientInfo;amount
Alice;${VALID_RECIPIENT_INFO};0.5`;

    const { entries, skipped } = parsePrivateCSV(csv);

    expect(entries).toHaveLength(1);
    expect(skipped).toHaveLength(0);
    expect(entries[0].name).toBe("Alice");
    expect(entries[0].recipientInfo).toBe(VALID_RECIPIENT_INFO);
    expect(entries[0].amount).toBe("0.5");
  });

  it("does not split recipient info's internal commas as columns", () => {
    const csv = `Alice;${VALID_RECIPIENT_INFO};0.5`;
    const { entries } = parsePrivateCSV(csv);

    expect(entries[0].recipientInfo.split(",")).toHaveLength(5);
  });

  it("skips rows where recipient info doesn't have exactly 5 comma-separated parts", () => {
    const csv = `Alice;not,enough,parts;0.5`;
    const { entries, skipped } = parsePrivateCSV(csv);

    expect(entries).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("Invalid recipient info");
  });

  it("skips rows with invalid amounts", () => {
    const csv = `Alice;${VALID_RECIPIENT_INFO};0`;
    const { entries, skipped } = parsePrivateCSV(csv);

    expect(entries).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("Invalid amount");
  });

  it("skips rows missing a column", () => {
    const csv = `Alice;${VALID_RECIPIENT_INFO}`;
    const { entries, skipped } = parsePrivateCSV(csv);

    expect(entries).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("Expected 3 columns");
  });

  it("ignores comment and blank lines", () => {
    const csv = `# header comment

Alice;${VALID_RECIPIENT_INFO};0.5
`;
    const { entries, skipped } = parsePrivateCSV(csv);

    expect(entries).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });
});

describe("generatePrivateSampleCSV", () => {
  it("produces a template with the expected column structure", () => {
    const sample = generatePrivateSampleCSV();
    expect(sample).toContain(";");
    expect(sample.toLowerCase()).toContain("recipient");
  });
});
