import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import { MotionProvider } from "@/components/motion-provider";
import { Entrance } from "@/components/motion/entrance";
import { Suspense } from "react";
import { HeaderSkeleton } from "@/components/headerSkeleton";

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
        "antialiased font-sans",
        bricolage.variable,
        jakarta.variable,
        jetbrains.variable
      )}
    >
      <body className="flex min-h-dvh flex-col md:h-dvh">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <Toaster />
            <div className="relative z-0 flex flex-1 flex-col bg-app-radial md:min-h-0">
              <Entrance>
                <Suspense fallback={<HeaderSkeleton />}>
                  <Header />
                </Suspense>
              </Entrance>
              {children}
            </div>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
