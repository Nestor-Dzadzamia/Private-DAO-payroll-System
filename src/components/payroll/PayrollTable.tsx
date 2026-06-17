import { PayrollEntry, TransferResult } from "@/types/payroll";
import { Badge } from "../ui/Badge";

type Props = {
  entries: PayrollEntry[];
  results?: TransferResult[];
  currentIndex?: number;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function PayrollTable({ entries, results, currentIndex }: Props) {
  const total = entries.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-left border-b border-slate-800">
            <th className="pb-2 font-medium">#</th>
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Address</th>
            <th className="pb-2 font-medium text-right">Amount (USDC)</th>
            {results && (
              <th className="pb-2 font-medium text-right">Status</th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const result = results?.[i];
            const isActive = currentIndex === i;

            return (
              <tr
                key={i}
                className={`border-b border-slate-800/50 transition-colors ${
                  isActive ? "bg-violet-900/20" : ""
                }`}
              >
                <td className="py-3 text-slate-600">{i + 1}</td>
                <td className="py-3 text-slate-200 font-medium">
                  {entry.name}
                </td>
                <td className="py-3 text-slate-400 font-mono text-xs">
                  {shortAddr(entry.address)}
                </td>
                <td className="py-3 text-right text-slate-200">
                  {parseFloat(entry.amount).toLocaleString()}
                </td>
                {results && (
                  <td className="py-3 text-right">
                    {isActive ? (
                      <Badge status="processing" />
                    ) : result ? (
                      <Badge status={result.status as "pending" | "success" | "error"} />
                    ) : (
                      <Badge status="pending" />
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="text-slate-400">
            <td colSpan={3} className="pt-3 font-semibold">
              Total
            </td>
            <td className="pt-3 text-right font-bold text-slate-200">
              {total.toLocaleString()} USDC
            </td>
            {results && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
