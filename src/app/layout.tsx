import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boy Math: Cost per Nut (CPN)",
  description: "Viral-but-useful CPN dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
