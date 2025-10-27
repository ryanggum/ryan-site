// src/app/assets/parks/yosemite/photos.ts

import glacier_1 from "./glacier_1.jpg";
import glacier_2 from "./glacier_2.jpg";
import glacier_3 from "./glacier_3.jpg";
import glacier_4 from "./glacier_4.jpg";

import valley_1 from "./valley_1.jpg";
import valley_2 from "./valley_2.jpg";
import valley_3 from "./valley_3.jpg";
import valley_4 from "./valley_4.jpg";
import valley_5 from "./valley_5.jpg";

import hike_1 from "./hike_1.jpg";
import hike_2 from "./hike_2.jpg";
import hike_3 from "./hike_3.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: glacier_1, alt: "Glacier Point — view 1", preview: true },
  { src: glacier_2, alt: "Glacier Point — view 2" },
  { src: glacier_3, alt: "Wildflower close-up" },
  { src: glacier_4, alt: "Clouds over Yosemite Valley" },

  { src: valley_1, alt: "Yosemite Valley overlook" },
  { src: valley_2, alt: "Yosemite Valley — meadow" },
  { src: valley_3, alt: "Yosemite Valley — river", preview: true },
  { src: valley_4, alt: "Yosemite Valley — sunset" },
  { src: valley_5, alt: "Granite formations" },

  { src: hike_1, alt: "Hike — segment 1" },
  { src: hike_2, alt: "Hike — segment 2" },
  { src: hike_3, alt: "Hike — segment 3", preview: true },
];

export default photos;
