
export default function Home() {
  return (
    <main className="relative min-h-dvh">
      <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-5xl font-medium mb-4">Ryan Gumlia</h1>
        <nav className="flex flex-col space-y-2 pl-4 text-neutral-500 text-lg">
          <a href="/parks" className="hover:text-neutral-700 transition-colors">
            parks →
          </a>
        </nav>
      </div>
    </main>
  );
}
