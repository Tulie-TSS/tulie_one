import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Workforce - AI Agent Management",
  description:
    "Deploy, manage, and orchestrate multiple AI agents as virtual employees. Automate tasks with intelligent agents that learn from your company's knowledge.",
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
