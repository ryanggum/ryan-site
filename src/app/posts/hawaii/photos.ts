import { Photo } from "@/lib/types";

import food from "@/app/assets/posts/hawaii/food.jpg";
import claw from "@/app/assets/posts/hawaii/claw.jpg";
import crest from "@/app/assets/posts/hawaii/crest.jpg";
import lean from "@/app/assets/posts/hawaii/lean.jpg";
import launch from "@/app/assets/posts/hawaii/launch.jpg";
import coast from "@/app/assets/posts/hawaii/coast.jpg";
import bay from "@/app/assets/posts/hawaii/bay.jpg";
import cook from "@/app/assets/posts/hawaii/cook.jpg";
import white from "@/app/assets/posts/hawaii/white.jpg";
import goat from "@/app/assets/posts/hawaii/goat.jpg";
import towel from "@/app/assets/posts/hawaii/towel.jpg";
import school from "@/app/assets/posts/hawaii/school.jpg";
import drive from "@/app/assets/posts/hawaii/drive.jpg";

import stars from "@/app/assets/posts/hawaii/stars.jpg";
import thinking from "@/app/assets/posts/hawaii/thinking.jpg";

// One entry per photo, keyed by filename. Grouping into rows happens at the
// call site in page.tsx, not here.
export const photos = {
  food: {
    src: food,
    alt: "[photo]",
    // caption: "Josh's Digital: Above"
  },
  stars: {
    src: stars,
    alt: "[photo]",
    // caption: "Josh's Digital: Above"
  },
  thinking: {
    src: thinking,
    alt: "[photo]",
    // caption: "My Digital: (Thinking...)"
  },
  claw: {
    src: claw,
    alt: "[photo]",
    // caption: "Josh's Digital: Claw"
  },
  launch: {
    src: launch,
    alt: "[photo]",
    // caption: "Josh's Digital: Launch"
  },
  lean: {
    src: lean,
    alt: "[photo]",
    // caption: "Josh's Digital: Launch"
  },
  crest: {
    src: crest,
    alt: "[photo]",
    // caption: "Josh's Digital: Crest"
  },
  coast: {
    src: coast,
    alt: "[photo]",
    // caption: "Josh's Digital: Coast"
  },
  cook: {
    src: cook,
    alt: "[photo]",
    // caption: "Josh's Digital: Coast"
  },
  bay: {
    src: bay,
    alt: "[photo]",
    // caption: "Josh's Digital: Coast"
  },
  white: {
    src: white,
    alt: "[photo]",
    // caption: "Josh's Digital: Coast"
  },
  towel: {
    src: towel,
    alt: "[photo]",
    // caption: "Josh's Digital: Above"
  },
  goat: {
    src: goat,
    alt: "[photo]",
    // caption: "Josh's Digital: Claw"
  },
  school: {
    src: school,
    alt: "[photo]",
    // caption: "Josh's Digital: Above"
  },
  drive: {
    src: drive,
    alt: "[photo]",
    // caption: "Josh's Digital: Claw"
  },
} satisfies Record<string, Photo>;
