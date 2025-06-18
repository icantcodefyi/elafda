import "~/styles/globals.css";

import { type Metadata } from "next";
import { siteConfig } from "~/site-config";
import { ThemeProvider } from "~/components/theme-provider";
import { SessionProviderWrapper } from "~/components/providers/session-provider";
import { Header } from "~/components/header";
import { Analytics } from "@vercel/analytics/next"
import { Footer } from "~/components/footer";
import { QueryProvider } from "~/components/providers/query-provider";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/logo.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-chirp" suppressHydrationWarning>
      <body>
        <SessionProviderWrapper>
          <QueryProvider>
            <ThemeProvider defaultTheme="light" storageKey="elafda-ui-theme">
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Analytics />
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
