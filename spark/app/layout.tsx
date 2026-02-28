import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientMuiNavbar from "./components/ClientMuiNavbar";
import ClientToolbarSpacer from "./components/ClientToolbarSpacer";
import ClientFooter from "./components/ClientFooter";
import ClientMuiProvider from "./components/ClientMuiProvider";
import ChatWidget from "./components/ChatWidget";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SparkStack — Your Personal AI Stack",
  description:
    "SparkStack is a private, high-performance workspace for building with AI. Fast SSR on Cloud Run, private by default.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AuthProvider>
          <ClientMuiProvider>
            <ClientMuiNavbar />
            <ClientToolbarSpacer />

            <main style={{ flex: 1 }}>{children}</main>

            <ClientFooter />
            <ChatWidget />
          </ClientMuiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
