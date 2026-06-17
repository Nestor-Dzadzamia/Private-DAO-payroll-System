import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-violet-600 hover:bg-violet-500 text-white disabled:bg-slate-700 disabled:text-slate-400",
  secondary:
    "bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:bg-slate-800 disabled:text-slate-500",
  danger:
    "bg-red-700 hover:bg-red-600 text-white disabled:bg-slate-700 disabled:text-slate-400",
  ghost:
    "bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-40",
};

export function Button({
  variant = "primary",
  loading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-150 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
