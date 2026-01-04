// src/app/assets/parks/yosemite/photos.ts

import j1 from "./1.jpg";
import j2 from "./2.jpg";
import j3 from "./3.jpg";
import j4 from "./4.jpg";
import j5 from "./5.jpg";
import j6 from "./6.jpg";

import beach from "./beach.jpg";
import flower from "./flower.jpg";
import flowers from "./flowers.jpg";
import coast from "./coast.jpg";
import pas from "./pas.jpg";
import court from "./court.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j1, alt: "", preview: true },
  { src: j2, alt: "" },
  { src: j4, alt: "" },
  { src: j3, alt: "" },
  { src: j5, alt: "" },
  { src: j6, alt: "" },
  { src: coast, alt: "" },
  { src: beach, alt: "", preview: true },
  { src: flower, alt: "" },
  { src: pas, alt: "" },
  { src: court, alt: "", preview: true },
  { src: flowers, alt: "" },
];

export default photos;
