// src/app/posts/page.tsx

import Link from "next/link";

const posts = [
  {
    title: "Writing about Oneself",
    year: "2025",
    href: "/posts/oneself",
  },
  // add more posts as needed
];

// Group posts by year
const postsByYear = posts.reduce<Record<string, typeof posts>>((acc, post) => {
  acc[post.year] = acc[post.year] || [];
  acc[post.year].push(post);
  return acc;
}, {});

export default function PostsPage() {
  return (
<main className="relative min-h-dvh px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20 bg-white dark:bg-black">

      <header className="mb-8 sm:mb-12 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2 text-black dark:text-white">
          posts
        </h1>
        <Link
          href="/"
          className="text-neutral-500 text-base sm:text-lg hover:text-neutral-700 transition-colors"
        >
          ←ryan gumlia
        </Link>
      </header>

      <section className="space-y-8">
        {Object.keys(postsByYear)
          .sort((a, b) => Number(b) - Number(a)) // Sort newest year first
          .map((year) => (
            <div key={year}>
              <h2 className="text-xl sm:text-2xl font-medium text-black dark:text-white mb-2 pl-4 sm:pl-8 lg:pl-32">
                {year}
              </h2>

              <div className="pl-8 sm:pl-16 lg:pl-40 space-y-2">

                {postsByYear[year].map((post, i) => (
                  <div key={post.href} className="text-black dark:text-white">
                    #{i + 1}:{" "}
                    <Link
                      href={post.href}
                      className="hover:text-neutral-500 transition-colors"
                    >
                      {post.title} (→)
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </section>
    </main>
  );
}
