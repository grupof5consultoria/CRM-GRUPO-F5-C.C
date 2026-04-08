import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Gestão Interna",
  description: "Plataforma de gestão interna e portal do cliente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#111111] text-gray-100 font-[family-name:var(--font-dm-sans)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
