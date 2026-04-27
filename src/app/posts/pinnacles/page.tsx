// src/app/posts/hawaii/page.tsx

"use client";
import PostShell from "../components/PostShell";
import { Prose } from "../components/Prose";
import { DayBreak } from "../components/DayBreak";
import { ImageGridStack } from "../components/GridStack";
import { a } from "./photos";

export default function Page() {
  return (
    <PostShell title="Pinnacles" subtitle="Trip Report: Pinnacles">
      {/* <Prose>
        I intended to leave at 5:00 AM, but I did not pull out of my driveway
        until 5:15. The first stop for any 5 northbound adventure is the Tejon
        outlet cluster on the opposite side of the Grapevine, namely the
        eastside Starbucks—-of Yosemite 2023 fame, maybe Sequoia 2024 fame, and
        not Redwoods 2025 fame. I made it in 2 hours and 15 minutes, (not bad),
        and ordered the same as on the Yosemite trip: a grande iced shaken
        espresso with caramel drizzle; also a breakfast sandwich.
      </Prose> */}
      {/* <Prose>
        The next stretch is classically straight. I trailed a blast Mustage for
        most of it, and I took joy from our relationships. We merged left and
        right together,
      </Prose> */}
      {/* <ImageGridStack images={a} width={600} /> */}

      <DayBreak />
    </PostShell>
  );
}
