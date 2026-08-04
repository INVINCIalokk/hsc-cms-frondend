"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"


export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, []) 

    if (!mounted) {
        return <div className="w-9 h-9 bg-muted rounded-md animate-pulse" />
    }

    const isDark = resolvedTheme === "dark"

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-md cursor-pointer hover:bg-accent/20 transition-colors"
        >
            {isDark ? (
                <Sun className="h-5 w-5 text-amber-500 transition-all hover:text-amber-300" />
            ) : (
                <Moon className="h-5 w-5 text-primary transition-all hover:text-black" />
            )}
        </button>
    )
}