// src/app/assets/parks/yosemite/photos.ts

import j1 from "./cur.jpg";
import j2 from "./dou.jpg";
import j3 from "./exp.jpg";
import j4 from "./flo.jpg";
import j5 from "./fra.jpg";
import j6 from "./ste.jpg";
import j7 from "./sti.jpg";
import j8 from "./tow.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j2, alt: "", preview: true },
	{ src: j5, alt: "", preview: true },
	{ src: j1, alt: "", preview: true },
  { src: j3, alt: "", preview: false },
	{ src: j4, alt: "", preview: false },
  { src: j6, alt: "", preview: false },
  { src: j7, alt: "", preview: false },
	{ src: j8, alt: "", preview: false },
];

export default photos;
