import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Match - Card Game",
  description: "A simple and fun memory card matching game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
