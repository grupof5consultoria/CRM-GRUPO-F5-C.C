import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#111111] text-gray-100 font-[family-name:var(--font-poppins)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
