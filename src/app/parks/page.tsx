// src/app/parks/page.tsx
import Link from "next/link";

import DisplayGrid from "./components/DisplayGrid";

import { albums } from "@/lib/albums";
import { groupAlbumsByYear, getMonthNameFromDate, hydrateAlbumsWithImages } from "./util/util";

export default async function ParksPage() 
{
	const albumsByYear = groupAlbumsByYear(albums);
	const albumsWithImagesByYear = await hydrateAlbumsWithImages(albumsByYear);

	return (
		<main className="relative min-h-dvh select-none px-4 py-10 sm:px-6 sm:py-14 md:px-12 md:py-20 lg:px-24 xl:px-48">
			<header className="mb-8 flex flex-col items-center sm:mb-12">
				<h1 className="mb-2 text-3xl font-medium sm:text-4xl md:text-5xl">
					rolls
				</h1>
				<Link href="/" className="text-base text-neutral-500 transition-colors hover:text-neutral-700 sm:text-lg">
					←ryan gumlia
				</Link>
			</header>
			<div className="mx-auto max-w-4xl">
				{albumsWithImagesByYear.map(({ year, albums }) => (
					<section key={year} className="mb-16 sm:mb-24">
						<h2 className="mb-6 text-xl font-medium sm:text-2xl">
							{year}
						</h2>
						{albums.map((album) => (
							<section key={album.slug} className="mb-10 sm:mb-16">
								<Link href={`/parks/${album.slug}`} className="inline-flex items-center gap-1 rounded text-base text-neutral-700 transition-colors hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 sm:text-lg">
									{album.title}→
								</Link>
								<div className="mb-3 mt-1 text-sm text-neutral-500 sm:text-base">
									<span>
										{getMonthNameFromDate(album.date)} {album.film.stock}{" "}
										{album.film.iso} {album.desc} {album.imageCount}
									</span>
								</div>
								<DisplayGrid title={album.title} images={album.images}/>
							</section>
						))}
					</section>
				))}
			</div>
		</main>
	);
}
