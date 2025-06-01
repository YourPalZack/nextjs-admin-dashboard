import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/Providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Colorado Trades Jobs - Find Blue-Collar Jobs in Colorado",
    template: "%s | Colorado Trades Jobs",
  },
  description: "Find construction, manufacturing, and skilled trade jobs across Colorado. Connect with employers looking for blue-collar workers.",
  keywords: "jobs, Colorado, construction, manufacturing, trades, blue collar, employment",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://coloradotradesjobs.com",
    siteName: "Colorado Trades Jobs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Colorado Trades Jobs",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}