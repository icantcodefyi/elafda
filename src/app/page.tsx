import Link from "next/link";

import { LatestPost } from "@/app/_components/posts";
import { auth } from "@/server/auth";
import { HydrateClient, api } from "@/trpc/server";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		void api.post.all.prefetch();
	}

	return (
		<HydrateClient>
			<main className="container h-screen py-16">
				<div className="flex flex-col items-center justify-center gap-4">
					<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
						Create <span className="text-primary">T3</span> Turbo
					</h1>
					<AuthShowcase />

					<CreatePostForm />
					<div className="w-full max-w-2xl overflow-y-scroll">
						<Suspense
							fallback={
								<div className="flex w-full flex-col gap-4">
									<PostCardSkeleton />
									<PostCardSkeleton />
									<PostCardSkeleton />
								</div>
							}
						>
							<PostList />
						</Suspense>
					</div>
				</div>
			</main>
		</HydrateClient>
	);
}
