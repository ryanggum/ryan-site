// src/app/posts/revolver/page.tsx

"use client";
import PostShell from "../components/PostShell";
import { Prose } from "./../components/Prose";

export default function RevolverPage() {
  return (
    <PostShell title="Ranking Revolver">
      <Prose>Hey, what are you looking at?</Prose>
    </PostShell>
  );
}
