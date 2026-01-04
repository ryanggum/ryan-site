// src/app/assets/parks/yosemite/photos.ts

import type { Photo } from "@/lib/types";

import j1 from "./1.jpg";
import j2 from "./2.jpg";
import j3 from "./3.jpg";
import badlands from "./badlands.jpg";
import bemidji from "./bemidji.jpg";
import bison from "./bison.jpg";
import colorado from "./colorado.jpg";
import dock from "./dock.jpg";
import fifty from "./fifty.jpg";
// import flower from "./flower.jpg";
import gorge from "./gorge.jpg";
import minnesota from "./minnesota.jpg";
import missed from "./missed.jpg";
import nebraska from "./nebraska.jpg";
import pool from "./pool.jpg";
// import utah from "./utah.jpg";
import yellow from "./yellow.jpg";

const photos: Photo[] = [
  { src: yellow, alt: "", preview: true },
  { src: fifty, alt: "" },
  { src: gorge, alt: "", preview: true },
  { src: colorado, alt: "" },
  // { src: utah, alt: "" },
  { src: missed, alt: "" },
  { src: j1, alt: "", preview: true },
  { src: j2, alt: "" },
  { src: pool, alt: "" },
  { src: j3, alt: "" },
  { src: bison, alt: "" },
  { src: badlands, alt: "" },
  { src: nebraska, alt: "" },
  { src: minnesota, alt: "" },
  { src: bemidji, alt: "" },
  { src: dock, alt: "" },
  // { src: flower, alt: "" },
];

export default photos;
