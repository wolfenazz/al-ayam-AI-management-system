'use client';

import React from 'react';

interface BadgeProps {
    variant: 'urgent' | 'high' | 'normal' | 'low' | 'status' | 'whatsapp' | 'neutral';
    children: React.ReactNode;
    className?: string;
    pulse?: boolean;
}

const variantStyles: Record<BadgeProps['variant'], string> = {
    urgent: 'bg-accent-red/10 text-accent-red border border-accent-red/20',
    high: 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20',
    normal: 'bg-accent-green/10 text-accent-green border border-accent-green/20',
    low: 'bg-blue-50 text-blue-600 border border-blue-200',
    status: 'bg-primary/10 text-primary border border-primary/20',
    whatsapp: 'bg-green-50 text-green-700 border border-green-200',
    neutral: 'bg-[#e8eaf2] text-[#536293] border border-[#d1d6e5]',
};

export default function Badge({ variant, children, className = '', pulse = false }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
        ${variantStyles[variant]}
        ${pulse ? 'animate-pulse-badge' : ''}
        ${className}
      `}
        >
            {children}
        </span>
    );
}
