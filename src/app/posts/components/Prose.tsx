// src/app/posts/components/Prose.tsx
import { ReactNode, ElementType } from "react";

type ProseProps<T extends ElementType = "p"> = {
  as?: T;
  children: ReactNode;
};

export function Prose<T extends ElementType = "p">({
  as,
  children,
}: ProseProps<T>) {
  const Component = as ?? "p";

  return (
    <Component className="prose dark:prose-invert max-w-[75ch] mx-auto my-3">
      {children}
    </Component>
  );
}
