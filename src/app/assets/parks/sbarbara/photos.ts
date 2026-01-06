// src/app/assets/parks/sbarbara/photos.ts

import j1 from "./rainbow.jpg";
import j2 from "./tacos.jpg";
// import j3 from "./hq.jpg";
// import j4 from "./grass.jpg";
// import j5 from "./helico.jpg";
import j6 from "./pioneer.jpg";
// import j7 from "./redondo.jpg";
// import j8 from "./tenant.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j1, alt: "", preview: true },
  { src: j2, alt: "", preview: true },
  // { src: j3, alt: "", preview: true },
  // { src: j4, alt: "", preview: false },
  // { src: j5, alt: "", preview: false },
  { src: j6, alt: "", preview: true },
  // { src: j7, alt: "", preview: false },
  // { src: j8, alt: "", preview: false },
];

export default photos;
