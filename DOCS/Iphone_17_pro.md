---
title: iPhone 17 Pro
date: 2025-01-27
description: iPhone 17 Pro device mockup with rounded corners, notch, and customizable screen image display.
author: karthikmudunuri
published: true
---

<ComponentPreview name="iphone-17-pro-demo" />

## Installation

<Tabs defaultValue="cli">

<TabsList>
  <TabsTrigger value="cli">CLI</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add @eldoraui/iphone-17-pro
```

</TabsContent>

<TabsContent value="manual">

<Steps>

<Step>Copy and paste the following code into your project.</Step>

`components/eldoraui/iphone-17-pro.tsx`

```tsx
import type { SVGProps } from "react"

export interface Iphone17ProProps extends SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  src?: string
}

export function Iphone17Pro({
  width = 200,
  height = 400,
  src,
  ...props
}: Iphone17ProProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="#303333"
        d="M196.11,128.09c0-.25-.2-.45-.45-.45-.11.04-.37.03-.69,0V36.69c0-17.84-14.46-32.31-32.31-32.31H37.48C19.63,4.39,5.17,18.85,5.17,36.69v48.99c-.3.02-.55.03-.66-.02-.25,0-.45.2-.45.45,0,0,0,17.29,0,17.29-.03.41.5.49,1.11.48v13.63c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v7.95c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v178.86c0,17.84,14.46,32.31,32.31,32.31h125.2c17.84,0,32.31-14.46,32.31-32.31v-188.87c.32-.02.58-.03.69.04,1.26.1.03-45.94.45-46.38ZM186.07,362.63c0,13.56-10.99,24.56-24.56,24.56H38.64c-13.56,0-24.56-10.99-24.56-24.56V37.37c0-13.56,10.99-24.56,24.56-24.56h122.87c13.56,0,24.56,10.99,24.56,24.56v325.26Z"
      />
      <path
        fill="#000000"
        d="M161.38,7.29H38.78c-16.54,0-29.95,13.41-29.95,29.95v325.52c0,16.54,13.41,29.95,29.95,29.95h122.6c16.54,0,29.95-13.41,29.95-29.95V37.24c0-16.54-13.41-29.95-29.95-29.95ZM186.07,362.57c0,13.6-11.02,24.62-24.62,24.62H38.7c-13.6,0-24.62-11.02-24.62-24.62V37.43c0-13.6,11.02-24.62,24.62-24.62h122.75c13.6,0,24.62,11.02,24.62,24.62v325.14Z"
      />

      <rect
        fill="currentColor"
        x="14.08"
        y="12.81"
        width="171.98"
        height="374.37"
        rx="24.62"
        ry="24.62"
      />
      {src && (
        <image
          href={src}
          x="14.08"
          y="12.81"
          width="171.98"
          height="374.37"
          rx="24.62"
          ry="24.62"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#roundedCorners)"
        />
      )}
      <path
        fill="#000000"
        d="M119.61,33.86h-38.93c-10.48-.18-10.5-15.78,0-15.96,0,0,38.93,0,38.93,0,4.41,0,7.98,3.57,7.98,7.98,0,4.41-3.57,7.98-7.98,7.98Z"
      />
      <path
        fill="#080d4c"
        d="M118.78,29.21c-4.32.06-4.32-6.73,0-6.66,4.32-.06,4.32,6.73,0,6.66Z"
      />

      <defs>
        <clipPath id="roundedCorners">
          <rect
            fill="#ffffff"
            x="14.08"
            y="12.81"
            width="171.98"
            height="374.37"
            rx="24.62"
            ry="24.62"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

```

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</Tabs>

## Usage

```tsx showLineNumbers
import { Iphone17Pro } from "@/components/eldoraui/iphone-17-pro"
```

```tsx showLineNumbers
<Iphone17Pro
  src="https://res.cloudinary.com/eldoraui/image/upload/v1759051266/469059-640_kwga4s.jpg"
  width={200}
  height={400}
  className="h-80 w-full"
/>
```

## Props

| Prop        | Type     | Default | Description                                      |
| ----------- | -------- | ------- | ------------------------------------------------ |
| `src`       | `string` | `-`     | The source of the image to display on the screen |
| `width`     | `number` | `200`   | The width of the iPhone 17 Pro mockup            |
| `height`    | `number` | `400`   | The height of the iPhone 17 Pro mockup           |
| `className` | `string` | `-`     | Additional CSS classes for styling               |
