// src/app/posts/revolver/page.tsx

import type { Metadata } from "next";
import PostShell from "../components/PostShell";
import { Prose } from "./../components/Prose";
import { getPostMeta, stripHtml } from "@/lib/posts";

const post = getPostMeta("revolver")!;

const title = stripHtml(post.title);
const description = post.description;

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function RevolverPage() {
  return (
    <PostShell title={<>Ranking <i>Revolver</i></>}>
      <Prose>Hey, what are you looking at?</Prose>
    </PostShell>
  );
}
