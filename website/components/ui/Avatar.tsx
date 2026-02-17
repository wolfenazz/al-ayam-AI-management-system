'use client';

import React from 'react';

interface AvatarProps {
    src?: string;
    alt?: string; // Made optional to fix potential usage issues
    size?: 'xs' | 'sm' | 'md' | 'lg';
    status?: 'online' | 'offline' | 'busy' | 'off_duty' | null;
    className?: string;
}

const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
};

const statusSizeClasses = {
    xs: 'w-2 h-2 -bottom-0.5 -right-0.5 border-[1.5px]',
    sm: 'w-3 h-3 -bottom-0.5 -right-0.5 border-2',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5 border-2',
    lg: 'w-4 h-4 bottom-0 right-0 border-2',
};

const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-300',
    busy: 'bg-accent-orange',
    off_duty: 'bg-gray-400',
};

export default function Avatar({ src, alt = '', size = 'md', status = null, className = '' }: AvatarProps) {
    const initials = (alt || 'User')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={`relative inline-flex shrink-0 ${className}`}>
            {src ? (
                <div
                    className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-cover bg-center ring-2 ring-white`}
                    style={{ backgroundImage: `url('${src}')` }}
                    title={alt}
                />
            ) : (
                <div
                    className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center ring-2 ring-white`}
                    title={alt}
                >
                    {initials}
                </div>
            )}
            {status && (
                <div
                    className={`absolute ${statusSizeClasses[size] || statusSizeClasses.md} ${statusColors[status]} bg-white rounded-full`}
                />
            )}
        </div>
    );
}
