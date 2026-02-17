---
title: Dotted Map
date: 2025-09-25
description: A component with a svg dotted map.
author: dillionverma
published: true
---

<ComponentPreview name="dotted-map-demo" />

## Installation

<Tabs defaultValue="cli">

<TabsList>
  <TabsTrigger value="cli">CLI</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add @magicui/dotted-map
```

</TabsContent>

<TabsContent value="manual">

<Steps>

<Step>Copy and paste the following code into your project.</Step>

```tsx
import * as React from "react"
import { createMap } from "svg-dotted-map"

import { cn } from "@/lib/utils"

interface Marker {
  lat: number
  lng: number
  size?: number
}

export interface DottedMapProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  mapSamples?: number
  markers?: Marker[]
  dotColor?: string
  markerColor?: string
  dotRadius?: number
  stagger?: boolean
}

export function DottedMap({
  width = 150,
  height = 75,
  mapSamples = 5000,
  markers = [],
  markerColor = "#FF6900",
  dotRadius = 0.2,
  stagger = true,
  className,
  style,
}: DottedMapProps) {
  const { points, addMarkers } = createMap({
    width,
    height,
    mapSamples,
  })

  const processedMarkers = addMarkers(markers)

  // Compute stagger helpers in a single, simple pass
  const { xStep, yToRowIndex } = React.useMemo(() => {
    const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x)
    const rowMap = new Map<number, number>()
    let step = 0
    let prevY = Number.NaN
    let prevXInRow = Number.NaN

    for (const p of sorted) {
      if (p.y !== prevY) {
        // new row
        prevY = p.y
        prevXInRow = Number.NaN
        if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size)
      }
      if (!Number.isNaN(prevXInRow)) {
        const delta = p.x - prevXInRow
        if (delta > 0) step = step === 0 ? delta : Math.min(step, delta)
      }
      prevXInRow = p.x
    }

    return { xStep: step || 1, yToRowIndex: rowMap }
  }, [points])

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-gray-500 dark:text-gray-500", className)}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {points.map((point, index) => {
        const rowIndex = yToRowIndex.get(point.y) ?? 0
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0
        return (
          <circle
            cx={point.x + offsetX}
            cy={point.y}
            r={dotRadius}
            fill="currentColor"
            key={`${point.x}-${point.y}-${index}`}
          />
        )
      })}
      {processedMarkers.map((marker, index) => {
        const rowIndex = yToRowIndex.get(marker.y) ?? 0
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0
        return (
          <circle
            cx={marker.x + offsetX}
            cy={marker.y}
            r={marker.size ?? dotRadius}
            fill={markerColor}
            key={`${marker.x}-${marker.y}-${index}`}
          />
        )
      })}
    </svg>
  )
}

```

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</Tabs>

## Examples

### Smaller Dots

<ComponentPreview name="dotted-map-demo-2" />

## Usage

```tsx showLineNumbers
import { DottedMap } from "@/components/ui/dotted-map"
```

```tsx showLineNumbers
<div className="relative h-[400px] w-full overflow-hidden rounded-xl border">
  <DottedMap />
</div>
```

## Props

| Prop          | Type                  | Default     | Description                                           |
| ------------- | --------------------- | ----------- | ----------------------------------------------------- |
| `width`       | `number`              | `150`       | Width of the SVG map.                                 |
| `height`      | `number`              | `75`        | Height of the SVG map.                                |
| `mapSamples`  | `number`              | `5500`      | Number of sample points for map generation.           |
| `markers`     | `Marker[]`            | `[]`        | Array of markers to display on the map.               |
| `dotColor`    | `string`              | `undefined` | Color of the map dots (uses currentColor if not set). |
| `markerColor` | `string`              | `"#FF6900"` | Color of the markers.                                 |
| `dotRadius`   | `number`              | `0.22`      | Radius of the map dots.                               |
| `className`   | `string`              | `undefined` | Additional class names applied to the SVG.            |
| `style`       | `React.CSSProperties` | `undefined` | Inline styles merged into the SVG.                    |
