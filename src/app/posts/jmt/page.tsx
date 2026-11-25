// src/app/posts/jmt/page.tsx
// Deployed JMT post. Imports only from assets/posts/jmt/ (tracked); the
// full working draft lives in the gitignored posts/jmt-raw route.

import type { Metadata } from "next";
import PostShell from "../components/PostShell";
import { ImageGridStack } from "../components/GridStack";
import { getPostMeta, stripHtml } from "@/lib/posts";

import day1Img1578 from "@/app/assets/posts/jmt/IMG_1578.jpg";

const post = getPostMeta("jmt")!;

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
    <PostShell title="I hiked the John Muir Trail" subtitle="Trip Report">
      <ImageGridStack title="" rows={[{ images: [day1Img1578], width: 600 }]} />
    </PostShell>
  );
}
