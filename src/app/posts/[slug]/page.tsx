// src/app/posts/[slug]/page.tsx

import path from "path";
import fs from "fs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import PostShell from "../components/PostShell";
import { getPostMeta } from "@/lib/posts";

export default async function PostPage({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const meta = getPostMeta(slug);

  if (!meta) return <div>Post not found.</div>;

  const filePath = path.join(process.cwd(), "content/posts", `${slug}.md`);
  const markdown = fs.readFileSync(filePath, "utf8");

  return (
    <PostShell
      title={meta.title}
      subtitle={meta.subtitle}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdown}
      </ReactMarkdown>
    </PostShell>
  );
}
