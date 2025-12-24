// src/app/posts/hawaii/page.tsx

"use client";
import PostShell from "../components/PostShell";

export default function RevolverPage() 
{
	return (
		<PostShell title="The Fate of O..." subtitle="Trip Report: Hawaii" visible={true}>
			<p>One second, please, I swear.</p>
		</PostShell>);
	}