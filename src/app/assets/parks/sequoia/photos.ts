// src/app/assets/parks/yosemite/photos.ts

import drive_1 from "./drive_1.jpg";
import drive_2 from "./drive_2.jpg";
import drive_3 from "./drive_3.jpg";
import drive_4 from "./drive_4.jpg";
import drive_5 from "./drive_5.jpg";
import drive_6 from "./drive_6.jpg";

import trees_1 from "./trees_1.jpg";
import trees_2 from "./trees_2.jpg";
import trees_3 from "./trees_3.jpg";
import trees_4 from "./trees_4.jpg";
import trees_5 from "./trees_5.jpg";
import trees_6 from "./trees_6.jpg";

import type { Photo } from "@/lib/types";

const photos: Photo[] = [
  { src: drive_1, alt: "Scenic drive 1", preview: true },
	{ src: trees_6, alt: "Forest trees 6" },
	{ src: trees_1, alt: "Forest trees 1"  },
  { src: trees_2, alt: "Forest trees 2" },
  { src: trees_3, alt: "Forest trees 3", preview: true   },

	{ src: trees_4, alt: "Forest trees 4" },
  { src: trees_5, alt: "Forest trees 5" },

	{ src: drive_5, alt: "Scenic drive 5", preview: true },
	{ src: drive_4, alt: "Scenic drive 4" },

  { src: drive_2, alt: "Scenic drive 2" },
  { src: drive_3, alt: "Scenic drive 3" },
  { src: drive_6, alt: "Scenic drive 6" },



  
];

export default photos;
