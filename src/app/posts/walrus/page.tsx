// src/app/posts/walrus/page.tsx

import type { Metadata } from "next";
import WalrusContent from "./WalrusContent";
import { getPostMeta, stripHtml } from "@/lib/posts";

const post = getPostMeta("walrus")!;

const title = stripHtml(post.title);
const description = post.description;

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function WalrusPage() {
  return <WalrusContent />;
}
