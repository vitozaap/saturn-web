"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, Loader2Icon, CircleX, XIcon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      richColors
      gap={6}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <CircleX className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
        close: (
          <XIcon className="size-5" />
        ),
      }}
      style={
        {
          "--width": "min(calc(100vw - 2rem), 1100px)",
          "--border-radius": "calc(var(--radius) * 1.3)",

          "--normal-bg": "var(--primary)",
          "--normal-border": "var(--primary)",
          "--normal-text": "0.98 0 0",

          "--info-bg": "oklch(0.55 0.18 259)",
          "--info-border": "oklch(0.68 0.19 259)",
          "--info-text": "oklch(0.98 0 0)",

          "--success-bg": "oklch(0.62 0.13 149)",
          "--success-border": "oklch(0.74 0.08 149)",
          "--success-text": "oklch(0.98 0 0)",

          "--warning-bg": "oklch(0.78 0.17 80)",
          "--warning-border": "oklch(0.80 0.09 85)",
          "--warning-text": "oklch(0.98 0 0)",

          "--error-bg": "oklch(0.58 0.19 27)",
          "--error-border": "oklch(0.7 0.2 27)",
          "--error-text": "oklch(0.98 0 0)",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: Infinity,
        closeButton: true,
        classNames: {
          toast: "!px-4 !gap-2 !py-2.5",
          title: "!font-medium !text-[0.9rem]",
          description: "opacity-90",
          closeButton: "!static !order-last !ml-auto !transform-none !size-8 !bg-transparent p-2 !border-transparent !opacity-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
