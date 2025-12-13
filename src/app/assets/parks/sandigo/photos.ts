// src/app/assets/parks/yosemite/photos.ts

import j1 from "./cul.jpg";
import j2 from "./day.jpg";
import j3 from "./dea.jpg";
import j4 from "./fre.jpg";
import j5 from "./pil.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
	{ src: j2, alt: "", preview: true },
  { src: j1, alt: "", preview: false },
  
  { src: j3, alt: "", preview: true },
	{ src: j4, alt: "", preview: false },
	{ src: j5, alt: "", preview: true },
];

export default photos;
