import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ravelston: Compliance Software for UK Letting Agents",
  description: "Portfolio risk dashboard, AI-drafted Section 8 and Section 13 notices, certificate tracking, and an encrypted audit vault. Built for the post-Section 21 world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
