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
		// caption: "Josh's Digital: Above"
  },
	{
    src: thinking,
    alt: "t",
		// caption: "My Digital: (Thinking...)"
  },
];

export default function Page() 
{
	return (
		<PostShell title="The Fate of O..." subtitle="Trip Report: Hawaii" visible={true}>
			<p>
				(Shorty...)
			</p>
			<div className="flex justify-center">
				<DisplayGrid title="idk" images={photos} width={600}/>
			</div>
		</PostShell>);
	}