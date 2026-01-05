// app/components/Header.tsx
import Link from "next/link";

export default function Header({ title }: { title: string }) {
  return (
    <header className="mb-4 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2 text-black dark:text-white">
        {title}
      </h1>

      <div className="text-black dark:text-white">
        ←
        <Link href="/" className="hover:text-neutral-500 transition-colors">
          ryan gumlia
        </Link>
      </div>
    </header>
  );
}
