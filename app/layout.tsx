import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NullShell",
  description: "Assistente técnico com memória, base de conhecimento e cache."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
