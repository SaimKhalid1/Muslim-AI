import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Islam AI — Study Assistant",
  description: "An Islam-focused study assistant with citations and local RAG.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
