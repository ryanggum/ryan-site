// app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ryangumlia.com"),
  title: { default: "Ryan Gumlia", template: "%s" },
  description:
    "I'm a compliance analyst at D. E. Shaw & Co. in New York City. Previously, I studied humanities and computer science at Yale.",
  alternates: { canonical: "https://ryangumlia.com" },
  openGraph: {
    title: { default: "Ryan Gumlia", template: "%s" },
    description: "Ryan Gumlia",
    url: "https://ryangumlia.com",
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
              url: "https://ryangumlia.com",
              sameAs: ["https://www.linkedin.com/in/ryangumlia"],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased min-h-dvh overscroll-none`}
      >
        {children}
      </body>
    </html>
  );
}
