// src/app/assets/parks/yosemite/photos.ts

import j1 from "./1.jpg";
import j2 from "./2.jpg";
import j3 from "./3.jpg";
import arvida from "./arvida.jpg";
import arya from "./arya.jpg";
import aum from "./aum.jpg";
import citrus from "./citrus.jpg";
import down from "./down.jpg";
import first from "./first.jpg";
import grum from "./grum.jpg";
import hangar from "./hangar.jpg";
import kappus from "./kappus.jpg";
import nik from "./nik.jpg";
import ocean from "./ocean.jpg";
import ryan from "./ryan.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: first, alt: "" },
  { src: arya, alt: "" },
  { src: nik, alt: "" },
  { src: down, alt: "" },
  { src: kappus, alt: "", preview: true },
  { src: j1, alt: "" },
  { src: aum, alt: "", preview: true },
  { src: j2, alt: "" },
  { src: j3, alt: "" },
  { src: ocean, alt: "" },
  { src: ryan, alt: "" },
  { src: arvida, alt: "" },
  { src: hangar, alt: "" },
  { src: grum, alt: "" },
  { src: citrus, alt: "", preview: true },
];

export default photos;
