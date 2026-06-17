import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Private DAO Payroll",
  description:
    "Pay your DAO contributors privately using Hinkal's ZK shielded pool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0d0d1a] text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
