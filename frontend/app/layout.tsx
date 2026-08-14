import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LingoLoop — Learn. Loop. Level up.",
  description:
    "An original language-learning experience powered by iterative learning loops: Learn, Practice, Recall, Earn, and Repeat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink selection:bg-mint selection:text-ink font-body">
        {children}
      </body>
    </html>
  );
}
