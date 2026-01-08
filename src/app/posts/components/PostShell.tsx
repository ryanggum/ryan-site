// src/app/posts/components/PostShell.tsx

import { ReactNode } from "react";
import PostHeader from "./PostHeader";

export default function PostShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20">
        <PostHeader title={title} subtitle={subtitle} />
        <article>{children}</article>
      </div>
    </main>
  );
}
