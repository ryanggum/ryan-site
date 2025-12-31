// src/app/posts/december/page.tsx

"use client";
import PostShell from "../components/PostShell";

export default function Page() {
  return (
    <PostShell title="December" visible={true}>
      <p>Well.</p>
    </PostShell>
  );
}
