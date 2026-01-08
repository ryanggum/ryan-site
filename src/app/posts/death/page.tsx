// src/app/posts/death/page.tsx

"use client";
import PostShell from "../components/PostShell";
import { ImageGridStack } from "../components/GridStack";
import { Prose } from "../components/Prose";
import { y, z, a, b, c, d, e } from "./photos";
// import { DayBreak } from "../components/DayBreak";

export default function Page() {
  return (
    <PostShell title="Death Valley">
      <Prose>(—)</Prose>
      <ImageGridStack images={z} width={1200} />
      {/* <ImageGridStack images={a} width={300} square /> */}
    </PostShell>
  );
}

{
  /* <ImageGridStack images={y} width={750} />
      <ImageGridStack images={c} width={900} /> */
}
