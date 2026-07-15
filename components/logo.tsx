"use client"
import { useTheme } from "next-themes";
import Image from "next/image";

interface LogoProps {
    className?: string
    width?: number
    height?: number
}

export function Logo({ className, height = 38, width = 38 }: LogoProps) {
    const { resolvedTheme } = useTheme()
    let src
    switch (resolvedTheme) {
        case "light":
            src = "/logo/light.svg"
        case "dark":
            src = "/logo/dark.svg"
        default:
            src = "/logo/light.svg"
    }
    return (
        <Image src={src} className={className} height={height} width={width} alt="squish-logo" loading="eager" />
    )
}