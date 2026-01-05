// src/app/posts/page.tsx

import Link from "next/link";
import Header from "@/app/components/Header";
import { Post } from "@/lib/types";
import { posts } from "@/lib/posts";

function groupPostsByYear(posts: Post[]) {
  const postsByYear: Record<string, Post[]> = {};

  for (const post of posts) {
    const year = String(Math.trunc(post.date / 10000));
    (postsByYear[year] ??= []).push(post);
  }

  Object.values(postsByYear).forEach((yearPosts) => {
    yearPosts.sort((a, b) => b.date - a.date);
  });

  return postsByYear;
}

export default function Page() {
  const postsByYear = groupPostsByYear(posts);

  return (
    <main className="relative min-h-dvh px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20 bg-white dark:bg-black">
      <Header title={"posts"} />
      <div className="flex flex-col items-center">
        <div className="mb-4 w-full sm:w-[60%] sm:max-w-[660px] border-t border-black dark:border-white" />
      </div>
      <section className="flex flex-col items-center">
        <div className="w-full sm:w-[60%] sm:max-w-[660px]">
          {Object.keys(postsByYear)
            .sort((a, b) => Number(b) - Number(a))
            .map((year) => (
              <div key={year} className="mb-4">
                <h2 className="text-xl sm:text-2xl font-medium text-black dark:text-white mb-2">
                  {year}
                </h2>
                <div className="pl-2 sm:pl-6 lg:pl-10 space-y-2">
                  {postsByYear[year].map((post) => (
                    <div key={post.slug} className="text-black dark:text-white">
                      #{post.num}:{" "}
                      <Link
                        href={`/posts/${post.slug}`}
                        className="hover:text-neutral-500 transition-colors"
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: post.title }}
                        />
                      </Link>
                      →
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}
