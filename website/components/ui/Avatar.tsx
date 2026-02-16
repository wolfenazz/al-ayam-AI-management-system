'use client';

import React from 'react';

interface AvatarProps {
    src?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    status?: 'online' | 'offline' | 'busy' | null;
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
};

const statusSizeClasses = {
    sm: 'w-3 h-3 -bottom-0.5 -right-0.5 border-2',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5 border-2',
    lg: 'w-4 h-4 bottom-0 right-0 border-2',
};

const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-300',
    busy: 'bg-accent-orange',
};

export default function Avatar({ src, alt, size = 'md', status = null, className = '' }: AvatarProps) {
    const initials = alt
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={`relative inline-flex shrink-0 ${className}`}>
            {src ? (
                <div
                    className={`${sizeClasses[size]} rounded-full bg-cover bg-center ring-2 ring-white`}
                    style={{ backgroundImage: `url('${src}')` }}
                    title={alt}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center ring-2 ring-white`}
                    title={alt}
                >
                    {initials}
                </div>
            )}
            {status && (
                <div
                    className={`absolute ${statusSizeClasses[size]} ${statusColors[status]} border-white rounded-full`}
                />
            )}
        </div>
    );
}
