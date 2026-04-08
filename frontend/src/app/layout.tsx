import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darukaa Earth",
  description: "Geospatial analytics platform for carbon and biodiversity projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}