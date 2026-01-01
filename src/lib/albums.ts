// src/lib/albums.ts
import type { AlbumMeta } from "./types";

export const albums: AlbumMeta[] = [
  {
    num: 1,
    date: 202306,
    film: { iso: 100, stock: "Ektar" },
    slug: "tustin",
    title: "Tustin",
    desc: "Images",
  },
  {
    num: 2,
    date: 202306,
    film: { iso: 100, stock: "Ektar" },
    slug: "joshua_1",
    title: "Joshua Tree no. 1",
    desc: "Images",
  },
  {
    num: 3,
    date: 202307,
    film: { iso: 200, stock: "Gold" },
    slug: "bemidji",
    title: "Bemidji",
    desc: "Images",
  },
  {
    num: 4,
    date: 202307,
    film: { iso: 401, stock: "Pan" },
    slug: "sandigo",
    title: "San Diego",
    desc: "Images",
  },
  {
    num: 5,
    date: 202308,
    film: { iso: 800, stock: "Cinestill" },
    slug: "arrowhead",
    title: "Arrowhead",
    desc: "Images",
  },
  {
    num: 6,
    date: 202308,
    film: { iso: 160, stock: "Portra" },
    slug: "yosemite",
    title: "Yosemite",
    desc: "Images",
  },
  {
    num: 7,
    date: 202401,
    film: { iso: 401, stock: "???" },
    slug: "joshua_2",
    title: "Joshua Tree no. 2",
    desc: "Images",
  },
  {
    num: 8,
    date: 202403,
    film: { iso: 400, stock: "Fujifilm" },
    slug: "sequoia",
    title: "Sequoia",
    desc: "Images",
  },
  {
    num: 9,
    date: 202406,
    film: { iso: 100, stock: "Ektachrome" },
    slug: "zion",
    title: "Zion",
    desc: "Images",
  },
  {
    num: 10,
    date: 202505,
    film: { iso: 100, stock: "Ektar" },
    slug: "teton",
    title: "Grand Teton & Yellowstone",
    desc: "Images",
  },
  {
    num: 11,
    date: 202505,
    film: { iso: 100, stock: "Ektachrome" },
    slug: "redwoods",
    title: "Redwoods",
    desc: "Images",
  },
  {
    num: 12,
    date: 202512,
    film: { iso: 400, stock: "???" },
    slug: "hawaii",
    title: "Hawaii",
    desc: "Images",
  },
];

export const albumSlugs = albums.map((a) => ({ slug: a.slug }));
export const getAlbumMeta = (slug: string) =>
  albums.find((a) => a.slug === slug);
