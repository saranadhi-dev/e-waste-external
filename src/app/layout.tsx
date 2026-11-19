import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Waste Collection Portal",
  description: "Web application for individual store owners to manage e-waste collection entries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
