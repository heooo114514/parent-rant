import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import config from '../../parent-rant.config.json'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${config.site.name}: ${config.site.description}`,
  description: config.site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          // @ts-ignore
          '--primary-color': config.ui.primaryColor,
          '--secondary-color': config.ui.secondaryColor,
        }}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
