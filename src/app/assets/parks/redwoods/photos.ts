// src/app/assets/parks/yosemite/photos.ts

import j1 from "./1.jpg";
import j2 from "./2.jpg";
import j3 from "./3.jpg";
import j4 from "./4.jpg";
import j5 from "./5.jpg";
import j6 from "./6.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j4, alt: ""  },
	{ src: j1, alt: "", preview: true },
  { src: j2, alt: "", preview: true },
	{ src: j5, alt: ""  },
  { src: j3, alt: "", preview: true },
  { src: j6, alt: ""  },
];

export default photos;
