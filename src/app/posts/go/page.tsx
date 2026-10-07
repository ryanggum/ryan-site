import type { Metadata } from "next";
import PostShell from "../components/PostShell";
import { getPostMeta, stripHtml } from "@/lib/posts";
import LeaveBoard from "./LeaveBoard";

const post = getPostMeta("go")!;

const title = stripHtml(post.title);

export const metadata: Metadata = {
  title,
  openGraph: { title },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <PostShell title={post.title}>
      <LeaveBoard />
    </PostShell>
  );
}
