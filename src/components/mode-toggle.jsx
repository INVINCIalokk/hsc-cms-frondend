"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"


export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Prevent hydration mismatch by waiting until the component is mounted on the client
    React.useEffect(() => {
        setMounted(true)
    })
    if (!mounted) {
        return <div className="w-10 h-5 bg-muted rounded-full animate-pulse" />
    }


    // Check if the current active state is dark mode
    const isDark = resolvedTheme === "dark"

    const handleToggle = (checked) => {
        setTheme(checked ? "dark" : "light")
    }

    return (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-muted-foreground/10">
            <Sun className={`h-4 w-4 transition-colors ${!isDark ? 'text-amber-500' : 'text-muted-foreground'}`} />

            <Switch
                id="theme-toggle"
                checked={isDark}
                onCheckedChange={handleToggle}
            />
            <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-indigo-400' : 'text-muted-foreground'}`} />
        </div>
    )
}