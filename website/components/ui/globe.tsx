"use client"

import { useEffect, useRef, useState } from "react"
import createGlobe, { COBEOptions } from "cobe"
import { useMotionValue, useSpring } from "framer-motion"

import { cn } from "@/lib/utils"

const MOVEMENT_DAMPING = 1400

const GLOBE_CONFIG: COBEOptions = {
    width: 100,
    height: 800,
    onRender: () => { },
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 0.8,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [1, 1, 1],
    markerColor: [0 / 255, 135 / 255, 204 / 255],
    glowColor: [1, 1, 1],
    markers: [
        { location: [26.0667, 50.5577], size: 0.1 },
    ],
}

export function Globe({
    className,
    config = GLOBE_CONFIG,
}: {
    className?: string
    config?: COBEOptions
}) {
    let phi = 0
    let width = 0
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pointerInteracting = useRef<number | null>(null)
    const pointerInteractionMovement = useRef(0)
    const [isDark, setIsDark] = useState(false)

    const r = useMotionValue(0)
    const rs = useSpring(r, {
        mass: 1,
        damping: 30,
        stiffness: 100,
    })

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"))
        }
        updateTheme()
        const observer = new MutationObserver(updateTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })
        return () => observer.disconnect()
    }, [])

    const updatePointerInteraction = (value: number | null) => {
        pointerInteracting.current = value
        if (canvasRef.current) {
            canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
        }
    }

    const updateMovement = (clientX: number) => {
        if (pointerInteracting.current !== null) {
            const delta = clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta
            r.set(r.get() + delta / MOVEMENT_DAMPING)
        }
    }

    useEffect(() => {
        const onResize = () => {
            if (canvasRef.current) {
                width = canvasRef.current.offsetWidth
            }
        }

        window.addEventListener("resize", onResize)
        onResize()

        // Dynamic colors based on theme
        const themeConfig = isDark ? {
            width: 100,
            height: 800,
            baseColor: [1, 1, 1] as [number, number, number], // White land for high contrast
            glowColor: [0.5, 0.5, 0.5] as [number, number, number], // Soft white glow
            markerColor: [0 / 255, 135 / 255, 204 / 255] as [number, number, number],
            dark: 1,
        } : {
            baseColor: [1, 1, 1] as [number, number, number],
            glowColor: [1, 1, 1] as [number, number, number],
            markerColor: [0 / 255, 135 / 255, 204 / 255] as [number, number, number],
            dark: 0,
        }

        const globe = createGlobe(canvasRef.current!, {
            ...config,
            ...themeConfig,
            width: width * 2,
            height: width * 2,
            onRender: (state) => {
                if (!pointerInteracting.current) phi += 0.005
                state.phi = phi + rs.get()
                state.width = width * 2
                state.height = width * 2
            },
        })

        setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0)
        return () => {
            globe.destroy()
            window.removeEventListener("resize", onResize)
        }
    }, [rs, config, isDark])

    return (
        <div
            className={cn(
                "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
                className
            )}
        >
            <canvas
                className={cn(
                    "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
                )}
                ref={canvasRef}
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX
                    updatePointerInteraction(e.clientX)
                }}
                onPointerUp={() => updatePointerInteraction(null)}
                onPointerOut={() => updatePointerInteraction(null)}
                onMouseMove={(e) => updateMovement(e.clientX)}
                onTouchMove={(e) =>
                    e.touches[0] && updateMovement(e.touches[0].clientX)
                }
            />
        </div>
    )
}
