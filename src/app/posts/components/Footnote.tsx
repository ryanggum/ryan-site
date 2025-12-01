"use client";

export default function Footnote({
	index,
	children,
	vis = true,
}: {
	index: number;
	children: React.ReactNode;
	vis?: boolean;
}) {
	if (!vis) {
		// Placeholder that matches the visible element’s line-height + vertical alignment
		return (
<span
  className="
    relative inline-block align-baseline
    w-[0.55ch]    /* perfect minimal space */
  "
/>
		);
	}

	return (
<span className="relative inline-block group mr-1 align-baseline">
  <sup
    className="
      cursor-pointer text-blue-600 dark:text-blue-400
      relative top-[-0.35em]
    "
  >
    {index}
  </sup>

<span
  className="
    absolute left-full -top-8 ml-2
    p-2
    border border-neutral-200 dark:border-neutral-700
    bg-white dark:bg-neutral-900
    text-neutral-800 dark:text-neutral-200
    text-sm z-20
    shadow-md shadow-neutral-400/20 dark:shadow-black/40
    opacity-0 pointer-events-none
    group-hover:opacity-100 group-hover:pointer-events-auto
    transition-opacity duration-150
    whitespace-nowrap
  "
>
  {index}. {children}
</span>

</span>

	);
}