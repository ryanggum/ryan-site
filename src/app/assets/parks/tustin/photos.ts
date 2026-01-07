import j1 from "./con.jpg";
import j2 from "./bru.jpg";
import j3 from "./tom.jpg";
import j4 from "./gab.jpg";
import j5 from "./har.jpg";
import j6 from "./san.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j5, alt: "", preview: true },
  { src: j4, alt: "", preview: false },
  { src: j2, alt: "", preview: true },
  { src: j3, alt: "", preview: false },
  { src: j6, alt: "", preview: false },
  { src: j1, alt: "", preview: true },
];

export default photos;
