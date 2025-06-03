import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { siteConfig } from "~/site-config";
import { ThemeProvider } from "~/components/theme-provider";
import { Header } from "~/components/header";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/logo-white.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="system"
          storageKey="elafda-ui-theme"
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
