// src/app/posts/components/PostHeader.tsx

export default function PostHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 flex flex-col items-center cursor-default">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-1 text-black dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-neutral-500 dark:text-neutral-400 text-lg sm:text-xl mb-2">
          {subtitle}
        </p>
      )}
    </header>
  );
}
