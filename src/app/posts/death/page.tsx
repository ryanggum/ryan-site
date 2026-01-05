// src/app/posts/death/page.tsx

"use client";
import PostShell from "../components/PostShell";
import { ImageGridStack } from "../components/GridStack";
import { a } from "./photos";
// import { DayBreak } from "../components/DayBreak";

export default function Page() {
  return (
    <PostShell
      title="Death Valley"
      subtitle="Trip Report: Death Valley"
      visible={true}
    >
      <p>
        <i>(film developing... : )</i>
      </p>
      <ImageGridStack images={a} width={600} square={true} />
    </PostShell>
  );
}
