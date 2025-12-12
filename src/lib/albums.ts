// src/lib/albums.ts
import type { AlbumMeta } from "./types";

export const albums: AlbumMeta[] = [
	{ date: 202306, film: { iso: 100, stock: "Ektar" 			}, slug: "joshua_1", title: "Joshua Tree no. 1", desc: "Images" },
  { date: 202308, film: { iso: 160, stock: "Portra" 		}, slug: "yosemite", title: "Yosemite", desc: "Images" 					},
	{ date: 202401, film: { iso: 200, stock: "Gold" 			}, slug: "joshua_2", title: "Joshua Tree no. 2", desc: "Images" },
	{ date: 202403, film: { iso: 400, stock: "Fujifilm" 	}, slug: "sequoia",  title: "Sequoia", desc: "Images" 					},
	{ date: 202406, film: { iso: 100, stock: "Ektachrome" }, slug: "zion", 		 title: "Zion", desc: "Images" 							},
	{ date: 202505, film: { iso: 100, stock: "Ektar" 			}, slug: "teton", 	 title: "Grand Teton & Yellowstone", desc: "Images" },
	{ date: 202505, film: { iso: 100, stock: "Ektachrome" }, slug: "redwoods", title: "Redwoods", desc: "Images", 
		writing: "so there are these structures, right, these constructions, " + 
		"they populate the northern coast, white abstract standings leaning out of grey sand, " +
		"sporadically placed and functionally inept, because what are those skeletons of brittle white bones angled together and facing always the sea, "
		+ "composed of hollowed spat out mulch, strewn effaced they stand there, too open to be shelter too sparse to be related too spare to not matter, "
		+ "there facing the water and wind lashing pebbled gristle, exposed to and knowing nothing but elements, "
		+ "somehow standing there not among footsteps never managed never collapsed, they’re defiant, empty, they are absence relic of some thing, "
		+ "reordered debris, why? everywhere, on beaches without roads, by springs boulders troves of like matter graveyards of trees plunged and ground by relentless swells, "
		+ "dissolved churned ashore like pulp hardened to stand and face the water, like fossils vertebrae of some invisible creature flesh drawing apart a final offering—you can’t go near them, "
		+ "you see them ways away, holy old an unattainable logic read as awe, breathing instinctual reverence for these forms impervious to the salt sifting the gusts, "
		+ "insulated weight in immortal fortitude, indivisible if they weren’t always new not always freshly splattered, turning your sorts making the coast foreign unconquerable and impossibly still, "
		+ "leaving you the only pulse: quick, shallow, quiet, insignificant far away from these callous white grained and praying animate faces to the sea"
	 },
];

export const albumSlugs = albums.map(a => ({ slug: a.slug }));
export const getAlbumMeta = (slug: string) => albums.find(a => a.slug === slug);

// quote: { text: "All this is the music of waters.", author: "John Wesley Powell" }
