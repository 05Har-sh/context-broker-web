import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SettingsModalProvider } from "@/components/SettingsModalProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Incident Intelligence Hub",
  description: "Context Broker Dashboard — Real-time incident management and monitoring platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased text-on-surface selection:bg-secondary-container`}>
        <ThemeProvider>
          <AuthProvider>
            <SettingsModalProvider>
              {children}
            </SettingsModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
