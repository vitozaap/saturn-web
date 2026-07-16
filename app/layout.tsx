import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { ThemeProvider, useTheme } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Squish - Compressor",
  description: "Your web media compressor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        bricolage.variable,
        jakarta.variable,
        jetbrains.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute inset-0 z-0 bg-[radial-gradient(120%_75%_at_50%_0%,#E2D3FA_0%,#FAF7FE_60%)] dark:bg-[radial-gradient(120%_75%_at_50%_0%,#241B3A_0%,#15101F_60%)]">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
