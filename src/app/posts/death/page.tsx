// src/app/posts/death/page.tsx

"use client";
import PostShell from "../components/PostShell";
import { ImageGridStack } from "../components/GridStack";
import { y, z, a, b, c, d, e } from "./photos";
// import { DayBreak } from "../components/DayBreak";

export default function Page() {
  return (
    <PostShell title="Death Valley">
      <p>Shorty...</p>
      <ImageGridStack images={z} width={600} />
      <ImageGridStack images={a} width={300} square />
      <ImageGridStack images={y} width={750} />
      <ImageGridStack images={c} width={900} />
    </PostShell>
  );
}
