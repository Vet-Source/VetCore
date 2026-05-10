import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VETcore - Blockchain Claims Platform",
  description: "Veterinary insurance claims powered by blockchain",
  icons: {
    icon: "/favicon.png",
    apple: "/logo-icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}