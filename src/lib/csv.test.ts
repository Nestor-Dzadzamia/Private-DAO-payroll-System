import { describe, it, expect } from "vitest";
import { parseCSV, generateSampleCSV } from "./csv";

describe("parseCSV", () => {
  it("parses valid rows into entries", () => {
    const csv = `# name, 0x_address, amount_usdc
Alice,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,1500
Bob,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,2200`;

    const { entries, skipped } = parseCSV(csv);

    expect(entries).toHaveLength(2);
    expect(skipped).toHaveLength(0);
    expect(entries[0]).toEqual({
      name: "Alice",
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amount: "1500",
    });
    expect(entries[1].name).toBe("Bob");
  });

  it("ignores comment lines and blank lines", () => {
    const csv = `# this is a header comment

Alice,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,100
# another comment
`;

    const { entries, skipped } = parseCSV(csv);

    expect(entries).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it("skips rows with malformed wallet addresses and reports why", () => {
    const csv = `Alice,not-an-address,100
Bob,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,200`;

    const { entries, skipped } = parseCSV(csv);

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Bob");
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("Invalid wallet address");
  });

  it("skips rows with a too-short address", () => {
    const csv = `Alice,0x1234,100`;
    const { entries, skipped } = parseCSV(csv);

    expect(entries).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("Invalid wallet address");
  });

  it("skips rows with zero, negative, or non-numeric amounts", () => {
    const csv = `Alice,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,0
Bob,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,-50
Carol,0x90F79bf6EB2c4f870365E785982E1f101E93b906,notanumber`;

    const { entries, skipped } = parseCSV(csv);

    expect(entries).toHaveLength(0);
    expect(skipped).toHaveLength(3);
    skipped.forEach((s) => expect(s.reason).toContain("Invalid amount"));
  });

  it("skips rows missing a column", () => {
    const csv = `Alice,0x70997970C51812dc3A010C7d01b50e0d17dc79C8`;
    const { entries, skipped } = parseCSV(csv);

    expect(entries).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("Expected 3 columns");
  });

  it("trims whitespace around fields", () => {
    const csv = `  Alice ,  0x70997970C51812dc3A010C7d01b50e0d17dc79C8  ,  1500  `;
    const { entries } = parseCSV(csv);

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Alice");
    expect(entries[0].amount).toBe("1500");
  });

  it("returns no entries for an empty CSV", () => {
    const { entries, skipped } = parseCSV("");
    expect(entries).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });
});

describe("generateSampleCSV", () => {
  it("produces a CSV that parseCSV can successfully parse", () => {
    const sample = generateSampleCSV();
    const { entries, skipped } = parseCSV(sample);

    expect(skipped).toHaveLength(0);
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((e) => {
      expect(e.name).toBeTruthy();
      expect(/^0x[0-9a-fA-F]{40}$/.test(e.address)).toBe(true);
      expect(parseFloat(e.amount)).toBeGreaterThan(0);
    });
  });
});
