"use client";
import { useCallback, useRef, useState } from "react";
import { PayrollEntry } from "@/types/payroll";
import { parseCSV, generateSampleCSV } from "@/lib/csv";
import { Button } from "../ui/Button";
import toast from "react-hot-toast";

type Props = {
  onEntries: (entries: PayrollEntry[]) => void;
};

export function CSVUpload({ onEntries }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const process = useCallback(
    (text: string) => {
      const entries = parseCSV(text);
      if (entries.length === 0) {
        toast.error(
          "No valid entries found. Format: name, 0x_address, amount"
        );
        return;
      }
      onEntries(entries);
      toast.success(`Loaded ${entries.length} employees`);
    },
    [onEntries]
  );

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => process(e.target?.result as string);
      reader.readAsText(file);
    },
    [process]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const downloadSample = () => {
    const blob = new Blob([generateSampleCSV()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_payroll.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-violet-500 bg-violet-900/20"
            : "border-slate-700 hover:border-slate-500"
        }`}
      >
        <p className="text-slate-400 text-sm">
          Drop your CSV here or{" "}
          <span className="text-violet-400 underline">click to browse</span>
        </p>
        <p className="text-slate-600 text-xs mt-1">
          Format: name, wallet_address, amount_usdc
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <Button variant="ghost" className="text-xs" onClick={downloadSample}>
        Download sample CSV
      </Button>
    </div>
  );
}
