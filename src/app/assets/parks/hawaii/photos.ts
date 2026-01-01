// src/app/assets/parks/yosemite/photos.ts

import j1 from "./one.jpg";
import j2 from "./two.jpg";
import j3 from "./thr.jpg";
// import j4 from "./fou.jpg";
import j5 from "./fiv.jpg";
import j6 from "./six.jpg";
import j7 from "./sev.jpg";
import j8 from "./sei.jpg";
import j9 from "./nin.jpg";
import j10 from "./ten.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j10, alt: "", preview: true },
  { src: j9, alt: "", preview: false },
  { src: j8, alt: "", preview: true },
  { src: j7, alt: "", preview: false },
  { src: j6, alt: "", preview: false },
  { src: j5, alt: "", preview: true },
  { src: j3, alt: "", preview: false },
  // { src: j4, alt: "", preview: false },
  { src: j2, alt: "", preview: false },
  { src: j1, alt: "", preview: false },
];

export default photos;
