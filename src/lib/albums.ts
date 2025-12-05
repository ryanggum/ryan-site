// src/lib/albums.ts
import type { AlbumMeta } from "./types";

export const albums: AlbumMeta[] = [
	{ slug: "joshua_1", title: "Joshua Tree no. 1", desc: "June 2023, Ektar 100" },
  { slug: "yosemite", title: "Yosemite", desc: "August 2023, Portra 160" },
	{ slug: "joshua_2", title: "Joshua Tree no. 2", desc: "January 2024, Gold 200" },
	{ slug: "sequoia", title: "Sequoia", desc: "March 2024, Fujifilm 400" },
	{ slug: "zion", title: "Zion", quote: { text: "All this is the music of waters.", author: "John Wesley Powell" }, desc: "July 2024, Ektachrome 100" },
	{ slug: "teton", title: "Grand Teton & Yellowstone", desc: "May 2025, Ektar 100" },
	{ slug: "redwoods", title: "Redwoods", desc: "May 2025, Ektachrome 100",
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
