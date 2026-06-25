import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conversiq AI - No-Code RAG Customer Support Agents",
  description: "Build custom AI-powered customer support agents trained on your business documents. Classify incoming chats and inspect transcripts with visual metrics dashboards.",
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
