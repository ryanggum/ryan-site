// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ryangumlia.com"),
  title: { default: "Ryan Gumlia", template: "%s" },
  description:
    "I'm a compliance analyst at the D. E. Shaw group in New York. Previously, I studied humanities and computer science at Yale.",
  alternates: { canonical: "https://www.ryangumlia.com" },
  openGraph: {
    title: { default: "Ryan Gumlia", template: "%s" },
    description: "Ryan Gumlia",
    url: "https://www.ryangumlia.com",
    siteName: "Ryan Gumlia",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Ryan Gumlia",
              url: "https://www.ryangumlia.com",
              sameAs: ["https://www.linkedin.com/in/ryangumlia"],
            }),
          }}
        />
      </head>
      <body className="antialiased min-h-dvh">{children}</body>
    </html>
  );
}
