"use client";
import { useState, useEffect, useRef } from "react";

export type Mode = "standard" | "dz";

export interface ModeSwitcherProps {
	mode: Mode;
	setMode: (m: Mode) => void;
}

export default function ModeSwitcher({ mode, setMode }: ModeSwitcherProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const stdRef = useRef<HTMLButtonElement | null>(null);
	const dzRef = useRef<HTMLButtonElement | null>(null);
	const underlineRef = useRef<HTMLSpanElement | null>(null);

	// Update underline position + width when mode changes
	useEffect(() => {
		const active = mode === "standard" ? stdRef.current : dzRef.current;
		const underline = underlineRef.current;
		const container = containerRef.current;

		if (!active || !underline || !container) return;

		const parentRect = container.getBoundingClientRect();
		const rect = active.getBoundingClientRect();

		underline.style.width = `${rect.width}px`;
		underline.style.left = `${rect.left - parentRect.left}px`;
	}, [mode]);

	return (
		<div className="flex justify-end mb-4">
			<div ref={containerRef} className="relative flex space-x-2">
				{/* underline */}
				<span
					ref={underlineRef}
					className="absolute bottom-0 h-[2px] bg-black dark:bg-white transition-all duration-300"
				/>
<button
	ref={stdRef}
	onClick={() => setMode("standard")}
	className={`
		pb-1 text-sm transition-colors inline-flex cursor-pointer
		${mode === "standard" ? "text-black dark:text-white" : "text-gray-400"}
	`}
>
	Standard
</button>

<button
	ref={dzRef}
	onClick={() => setMode("dz")}
	className={`
		pb-1 text-sm transition-colors inline-flex cursor-pointer
		${mode === "dz" ? "text-black dark:text-white" : "text-gray-400"}
	`}
>
	DZ Mode
</button>
			</div>
		</div>
	);
}