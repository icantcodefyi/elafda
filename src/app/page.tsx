import { PostsList } from "~/components/posts/posts-list";
import { type Metadata } from "next";
import { BrandAmbassadors } from "~/components/brand-ambassadors";

export const metadata: Metadata = {
  openGraph: {
    images: [{ url: "/og.png" }],
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">E-Lafdas</h1>
        <BrandAmbassadors />
      </div>

      <PostsList />
    </div>
  );
}
