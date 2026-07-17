"use client"
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";


export default function ThemeSwitch() {
    const { resolvedTheme, setTheme } = useTheme()
    const changeTheme = () => resolvedTheme == "dark" ? setTheme("light") : setTheme("dark")
    return (
        <Button variant={"ghost"} size={"icon"} onClick={changeTheme}>
            {resolvedTheme == "dark" ? <Sun /> : <Moon />}
        </Button>
    )
}