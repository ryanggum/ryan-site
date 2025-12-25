// src/app/posts/hawaii/page.tsx

"use client";
import { Photo } from "@/lib/types";
import PostShell from "../components/PostShell";
import DisplayGrid from "@/app/components/DisplayGrid";

import thinking from "@/app/assets/posts/hawaii/thinking.jpg"
import stars from "@/app/assets/posts/hawaii/stars.jpg"

export const photos: Photo[] = [
  {
    src: stars,
    alt: "t",
		caption: "Josh's Digital: Above"
  },
	{
    src: thinking,
    alt: "t",
		caption: "My Digital: (Thinking...)"
  },
];

export default function HawaiiPage() 
{
	return (
		<PostShell title="The Fate of O..." subtitle="Trip Report: Hawaii" visible={true}>
			<p>
				One hour into the trip, the 2014 Toyota Sienna that Josh and I parked half a mile from Costco’s Kailua Kona warehouse refused to start. 
				Two hours into the trip—after flooding the engine, shifting to neutral, and last gasp slamming down on both brake and gas—she roared to life. So we took a victory lap, trotting our triumph around the lot until Scott gained on our wounded course and waved us into his lot, to its back, to Ernesto, whose son taught me how to pop the hood and gently explained that radiators do not traditionally float in antifreeze, and that his father’s amusement meant we needed a new car. Three hours into the trip, we rolled stylishly out of Scott’s lot in an unregistered 2003 Cadillac CTS, and three hours and three minutes into the trip, I released her parking brake.
			</p>
			<p>
				She was a beater, he said. We didn’t like his cynicism and set out on the 9,000 foot ascent of Mauna Kea. 
				Clouds and showers had kicked us out of the bay beside our apartment, and the visitor center’s livestream promised that we could make it above them for a clear night, better, sans moonlight. 
				We picked up food at Da Broke Mouth Grindz, packed back into the CTS with heaping plates of well seasoned meat and rice, and started the navigation. 
				Maps suggested an hour and a half ride, but Maps wasn’t familiar with our game: we found early that going a decimal over 40 MPH caused the CTS to shake uncontrollably, so we cruised at 39, recklessly taunting law enforcement though the 40-minimum zones and splitting the cloud cover with the virulence of Icarus were he depressed and condemned for sloth. 
			</p>
			<div className="flex justify-center">
				<DisplayGrid title="idk" images={photos} width={600}/>
			</div>
			<p>(Soon...)</p>
		</PostShell>);
	}