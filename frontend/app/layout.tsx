import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Nunito_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  weight: ["500", "600", "700", "800"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  weight: ["400", "500", "600", "700"],
});

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
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink selection:bg-mint selection:text-ink font-body">
        {children}
      </body>
    </html>
  );
}
