import { HomeTabs } from "~/components/home-tabs";
import { type Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    images: [{ url: "/og.png" }],
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <HomeTabs />
    </div>
  );
}
