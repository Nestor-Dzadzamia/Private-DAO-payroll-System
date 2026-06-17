type BadgeProps = {
  status: "pending" | "success" | "error" | "processing";
  label?: string;
};

const styles = {
  pending: "bg-slate-700 text-slate-300",
  success: "bg-emerald-900 text-emerald-300",
  error: "bg-red-900 text-red-300",
  processing: "bg-violet-900 text-violet-300",
};

const labels = {
  pending: "Pending",
  success: "Sent",
  error: "Failed",
  processing: "Sending...",
};

export function Badge({ status, label }: BadgeProps) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {label ?? labels[status]}
    </span>
  );
}
