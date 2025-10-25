// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ryangumlia.com"),
  title: "Ryan Gumlia",
  description: "I'm a senior Humanities major at Yale heading into L&C at D. E. Shaw & Co.," +
	" and I'm broadly interested in law, linguistics, and tech.",
  alternates: { canonical: "https://ryangumlia.com" },
  openGraph: {
    title: "Ryan Gumlia",
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
        {/* ✅ Person schema for Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Ryan Gumlia",
              url: "https://ryangumlia.com",
              sameAs: [
                "https://www.linkedin.com/in/ryangumlia",
                // "https://github.com/ryangumlia"
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh overscroll-none`}
      >
        {children}
      </body>
    </html>
  );
}
