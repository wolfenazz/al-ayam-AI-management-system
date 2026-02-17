"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number
}

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    ...props
}: AnimatedThemeTogglerProps) => {
    const [isDark, setIsDark] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"))
        }

        // Check local storage on mount
        const storedTheme = localStorage.getItem("theme")
        if (storedTheme === "dark") {
            document.documentElement.classList.add("dark")
            setIsDark(true)
        } else if (storedTheme === "light") {
            document.documentElement.classList.remove("dark")
            setIsDark(false)
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            // Default to system preference if no storage
            document.documentElement.classList.add("dark")
            setIsDark(true)
        }

        updateTheme()

        const observer = new MutationObserver(updateTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })

        return () => observer.disconnect()
    }, [])

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return

        // @ts-ignore - view transition API
        if (document.startViewTransition) {
            // @ts-ignore - view transition API
            await document.startViewTransition(() => {
                flushSync(() => {
                    const newTheme = !isDark
                    setIsDark(newTheme)
                    document.documentElement.classList.toggle("dark")
                    localStorage.setItem("theme", newTheme ? "dark" : "light")
                })
            }).ready
        } else {
            // Fallback for browsers not supporting view transitions
            const newTheme = !isDark
            setIsDark(newTheme)
            document.documentElement.classList.toggle("dark")
            localStorage.setItem("theme", newTheme ? "dark" : "light")
            return;
        }

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const maxRadius = Math.hypot(
            Math.max(left, window.innerWidth - left),
            Math.max(top, window.innerHeight - top)
        )

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        )
    }, [isDark, duration])

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            className={cn("relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-surface transition-colors cursor-pointer select-none", className)}
            {...props}
        >
            {isDark ? <Sun className="size-6" /> : <Moon className="size-6" />}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
