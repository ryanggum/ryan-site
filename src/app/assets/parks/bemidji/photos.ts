// src/app/assets/parks/yosemite/photos.ts

import j1 from "./cur.jpg";
import j2 from "./dou.jpg";
import j3 from "./exp.jpg";
import j4 from "./flo.jpg";
import j5 from "./fra.jpg";
import j6 from "./ste.jpg";
import j7 from "./sti.jpg";
import j8 from "./tow.jpg";
import j9 from "./emm.jpg";
import j10 from "./sna.jpg";
import j11 from "./con.jpg";
import j12 from "./arj.jpg";
import j13 from "./rya.jpg";
import j14 from "./kia.jpg";
import j15 from "./mar.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: j4, alt: "", preview: false },
  { src: j8, alt: "", preview: false },
  { src: j11, alt: "", preview: false },
  { src: j9, alt: "", preview: false },
  { src: j13, alt: "", preview: false },

  { src: j5, alt: "", preview: true },
  { src: j7, alt: "", preview: false },
  { src: j6, alt: "", preview: false },
  { src: j14, alt: "", preview: false },
  { src: j12, alt: "", preview: false },

  { src: j2, alt: "", preview: true },
  { src: j10, alt: "", preview: false },
  { src: j3, alt: "", preview: false },
  { src: j15, alt: "", preview: false },
  { src: j1, alt: "", preview: true },
];

export default photos;
