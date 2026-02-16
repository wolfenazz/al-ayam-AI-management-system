'use client';

import React from 'react';

const features = [
    { icon: 'check', label: 'Automated Content Curation' },
    { icon: 'check', label: 'Real-time Task Tracking' },
    { icon: 'check', label: 'Intelligent Analytics' },
    { icon: 'check', label: 'WhatsApp Integration' },
];

export default function AuthLeftPanel() {
    return (
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#1a2f8a] to-[#0f172a]" />

            {/* Decorative Blurred Circles */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/40 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl transform translate-x-1/2" />
            <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                    <span className="material-symbols-outlined text-white">newspaper</span>
                </div>
                <span className="text-xl font-bold tracking-wide">Al-Ayyam AI</span>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-lg mb-12">
                {/* Version Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>AI-Powered Platform v2.0</span>
                </div>

                <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 tracking-tight">
                    Revolutionizing News Management with Intelligence
                </h1>
                <p className="text-lg text-blue-100/80 leading-relaxed font-light">
                    Streamline your editorial workflow with our advanced AI tools for content curation, fact-checking,
                    and task tracking.
                </p>

                {/* Feature List */}
                <div className="mt-12 space-y-4">
                    {features.map((feature) => (
                        <div key={feature.label} className="flex items-center gap-4 group">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">{feature.icon}</span>
                            </div>
                            <span className="text-blue-50 group-hover:text-white transition-colors">{feature.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-sm text-blue-200/60">
                © 2026 Al-Ayyam Media Group. All rights reserved.
            </div>
        </div>
    );
}
