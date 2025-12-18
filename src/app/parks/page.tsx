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
		<main className="relative min-h-dvh select-none px-4 py-10 sm:px-6 sm:py-14 md:px-12 md:py-20 lg:px-24 xl:px-48 text-black dark:text-white">
			<header className="flex flex-col items-center">
				<h1 className="text-3xl font-medium sm:text-4xl md:text-5xl">
					rolls
				</h1>
				<Link href="/" className="text-base transition-colors sm:text-lg text-black dark:text-white">
					←ryan gumlia
				</Link>
			</header>
			<div className="mx-auto max-w-4xl">
				<div>
					Hey!
				</div>
				{albumsWithImagesByYear.map(({ year, albums }) => (
					<section key={year} className="mb-12">
						<h2 className="text-2xl sm:text-3xl font-medium">
							{year}
						</h2>
						<div className="pl-6">
							{albums.map((album) => (
								<section key={album.slug} className="mb-6">
									<Link
										href={`/parks/${album.slug}`}
										className="inline-flex items-center gap-1 text-lg sm:text-xl font-medium text-black dark:text-white"
									>
										#{album.num}: {album.title}→
									</Link>
									<div className="pl-6">
										<div className="text-sm sm:text-base leading-snug text-black dark:text-white">
											<span>
												{getMonthNameFromDate(album.date)}. {album.film.stock} {album.film.iso}. {album.desc}. {album.imageCount}.
											</span>
										</div>
										<DisplayGrid
											title={album.title}
											images={album.images}
										/>
									</div>
								</section>
							))}
						</div>
					</section>
				))}
			</div>
		</main>
	);
}
