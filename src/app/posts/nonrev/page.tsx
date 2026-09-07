import type { Metadata } from "next";
import PostShell from "../components/PostShell";
import { getPostMeta, stripHtml } from "@/lib/posts";
import FlightMap from "./flightmap/FlightMap";

const post = getPostMeta("nonrev")!;

const title = stripHtml(post.title);

export const metadata: Metadata = {
  title,
  openGraph: { title },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <PostShell>
      {/* Viewport height minus PostShell's own py-10 / sm:py-14 / md:py-20,
          so the map fills the screen without ever scrolling it. */}
      <div className="h-[calc(100dvh-5rem)] sm:h-[calc(100dvh-7rem)] md:h-[calc(100dvh-10rem)]">
        <FlightMap />
      </div>
    </PostShell>
  );
}
