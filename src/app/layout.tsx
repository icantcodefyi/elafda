import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { siteConfig } from "~/site-config";
import { ThemeProvider } from "~/components/theme-provider";
import { SessionProviderWrapper } from "~/components/providers/session-provider";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { QueryProvider } from "~/components/providers/query-provider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/logo.svg" }],
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
        <SessionProviderWrapper>
          <QueryProvider>
            <ThemeProvider defaultTheme="light" storageKey="elafda-ui-theme">
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
