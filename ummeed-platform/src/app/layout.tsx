import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ummeed Coding Platform",
  description: "A competitive programming platform for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      }}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
