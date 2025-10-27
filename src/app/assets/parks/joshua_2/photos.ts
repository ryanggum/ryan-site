// src/app/assets/parks/yosemite/photos.ts

import j1 from "./1.jpg";
import j2 from "./2.jpg";
import j3 from "./3.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j1, alt: "", preview: true },
  { src: j2, alt: "", preview: true },
  { src: j3, alt: "", preview: true },
];

export default photos;
