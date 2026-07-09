import type { Metadata } from "next";
import { Inter, Itim, Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

const itim = Itim({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-handwriting",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GratiPin",
  description: "Nền tảng ghi nhận, biết ơn và lưu giữ kỷ niệm công ty",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${quicksand.variable} ${inter.variable} ${itim.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
