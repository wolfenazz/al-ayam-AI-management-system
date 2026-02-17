import type { SVGProps, ReactNode } from "react"

export interface Iphone17ProProps extends SVGProps<SVGSVGElement> {
    width?: number
    height?: number
    src?: string
    children?: ReactNode
}

export function Iphone17Pro({
    width = 310,
    height = 630,
    src,
    children,
    ...props
}: Iphone17ProProps) {
    // Screen area coordinates from the SVG (based on 200x400 viewBox)
    const screenX = 14.08
    const screenY = 12.81
    const screenW = 171.98
    const screenH = 374.37
    const screenRx = 24.62
    const scale = screenW / 320 // scale chat UI (designed for ~320px) into the SVG screen area

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Outer bezel */}
            <path
                fill="#303333"
                d="M196.11,128.09c0-.25-.2-.45-.45-.45-.11.04-.37.03-.69,0V36.69c0-17.84-14.46-32.31-32.31-32.31H37.48C19.63,4.39,5.17,18.85,5.17,36.69v48.99c-.3.02-.55.03-.66-.02-.25,0-.45.2-.45.45,0,0,0,17.29,0,17.29-.03.41.5.49,1.11.48v13.63c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v7.95c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v178.86c0,17.84,14.46,32.31,32.31,32.31h125.2c17.84,0,32.31-14.46,32.31-32.31v-188.87c.32-.02.58-.03.69.04,1.26.1.03-45.94.45-46.38ZM186.07,362.63c0,13.56-10.99,24.56-24.56,24.56H38.64c-13.56,0-24.56-10.99-24.56-24.56V37.37c0-13.56,10.99-24.56,24.56-24.56h122.87c13.56,0,24.56,10.99,24.56,24.56v325.26Z"
            />

            {/* Inner border */}
            <path
                fill="#000000"
                d="M161.38,7.29H38.78c-16.54,0-29.95,13.41-29.95,29.95v325.52c0,16.54,13.41,29.95,29.95,29.95h122.6c16.54,0,29.95-13.41,29.95-29.95V37.24c0-16.54-13.41-29.95-29.95-29.95ZM186.07,362.57c0,13.6-11.02,24.62-24.62,24.62H38.7c-13.6,0-24.62-11.02-24.62-24.62V37.43c0-13.6,11.02-24.62,24.62-24.62h122.75c13.6,0,24.62,11.02,24.62,24.62v325.14Z"
            />

            {/* Screen background */}
            <rect
                fill="#ffffff"
                x={screenX}
                y={screenY}
                width={screenW}
                height={screenH}
                rx={screenRx}
                ry={screenRx}
            />

            {/* Screen content — static image or live children */}
            {src && !children && (
                <image
                    href={src}
                    x={screenX}
                    y={screenY}
                    width={screenW}
                    height={screenH}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#iphoneRoundedCorners)"
                />
            )}

            {children && (
                <foreignObject
                    x={screenX}
                    y={screenY}
                    width={screenW}
                    height={screenH}
                    clipPath="url(#iphoneRoundedCorners)"
                >
                    <div
                        style={{
                            width: `${screenW / scale}px`,
                            height: `${screenH / scale}px`,
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            overflow: 'hidden',
                            borderRadius: `${screenRx / scale}px`,
                        }}
                    >
                        <div
                            style={{
                                width: `${screenW / scale}px`,
                                height: `${screenH / scale}px`,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </foreignObject>
            )}

            {/* Notch / Dynamic Island */}
            <path
                fill="#000000"
                d="M119.61,33.86h-38.93c-10.48-.18-10.5-15.78,0-15.96,0,0,38.93,0,38.93,0,4.41,0,7.98,3.57,7.98,7.98,0,4.41-3.57,7.98-7.98,7.98Z"
            />

            {/* Camera lens */}
            <path
                fill="#080d4c"
                d="M118.78,29.21c-4.32.06-4.32-6.73,0-6.66,4.32-.06,4.32,6.73,0,6.66Z"
            />

            <defs>
                <clipPath id="iphoneRoundedCorners">
                    <rect
                        fill="#ffffff"
                        x={screenX}
                        y={screenY}
                        width={screenW}
                        height={screenH}
                        rx={screenRx}
                        ry={screenRx}
                    />
                </clipPath>
            </defs>
        </svg>
    )
}
