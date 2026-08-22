import type { Metadata } from "next";
import PostShell from "../components/PostShell";
import { Prose } from "../components/Prose";
import { getPostMeta, stripHtml } from "@/lib/posts";

const post = getPostMeta("lattes")!;

const title = stripHtml(post.title);
const description = post.description;

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <PostShell title="Ranking Coffee Shops">
      <Prose>* * *</Prose>
    </PostShell>
  );
}
