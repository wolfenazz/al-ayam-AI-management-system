'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { logout } from '@/lib/firebase/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, employee } = useAuth();
    const { searchQuery, setSearchQuery, toggleSidebar } = useUIStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount } = useNotifications();

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const displayName = employee?.name || user?.displayName || 'User';
    const displayEmail = user?.email || '';
    const avatarUrl = employee?.avatar_url || user?.photoURL || '';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-border bg-card px-6 py-3 shrink-0 z-20">
            <div className="flex items-center gap-4 lg:gap-8">
                {/* Mobile menu button */}
                <button
                    onClick={toggleSidebar}
                    className="flex md:hidden items-center justify-center rounded-lg p-2 hover:bg-surface text-text-secondary transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 text-primary">
                    <div className="relative size-8 shrink-0">
                        <Image
                            src="/images/alayam-logo-small.webp"
                            alt="Al-Ayyam Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
                        AI Platform
                    </h2>
                </div>

                {/* Search Bar */}
                <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-96 w-full lg:w-96">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full relative group">
                        <div className="text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-colors group-focus-within:text-primary">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 border-none bg-surface focus:bg-card transition-all h-full placeholder:text-text-secondary pl-10 pr-4 text-sm font-normal leading-normal"
                            placeholder="Search tasks, reporters, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </label>
            </div>

            <div className="flex flex-1 justify-end gap-6 items-center">
                <AnimatedThemeToggler />
                {/* Navigation Links */}
                {/* Navigation Links Removed - Moved to Sidebar */}

                <div className="flex gap-2 items-center border-l border-border pl-4 lg:pl-6">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="flex items-center justify-center rounded-full size-10 hover:bg-surface text-text-secondary transition-colors relative"
                        >
                            <span className="material-symbols-outlined text-[24px]">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 size-2 bg-accent-red rounded-full ring-2 ring-white animate-pulse-badge" />
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-card rounded-xl shadow-xl border border-border z-50 animate-fade-in overflow-hidden">
                                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-text-primary">Notifications</h3>
                                    <span className="text-xs bg-accent-red/10 text-accent-red px-2 py-0.5 rounded-full font-bold">
                                        {unreadCount} new
                                    </span>
                                </div>
                                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`px-4 py-3 hover:bg-surface transition-colors cursor-pointer border-b border-border/50 ${notif.status !== 'READ' ? 'bg-primary-light/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.priority === 'CRITICAL' ? 'bg-accent-red' :
                                                    notif.priority === 'HIGH' ? 'bg-accent-orange' : 'bg-primary'
                                                    }`} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-text-primary">{notif.title}</p>
                                                    <p className="text-xs text-text-secondary truncate">{notif.message}</p>
                                                    <p className="text-[10px] text-text-secondary mt-1">
                                                        {formatTimeAgo(notif.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2.5 border-t border-border">
                                    <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors w-full text-center">
                                        View All Notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <button className="flex items-center justify-center rounded-full size-10 hover:bg-surface text-text-secondary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                    </button>

                    {/* User Avatar & Dropdown */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 ml-2 cursor-pointer group"
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    referrerPolicy="no-referrer"
                                    className="rounded-full size-10 ring-2 ring-white group-hover:ring-primary/20 transition-all object-cover"
                                />
                            ) : (
                                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold ring-2 ring-white group-hover:ring-primary/20 transition-all">
                                    {initials}
                                </div>
                            )}
                            <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-primary transition-colors hidden sm:block">
                                {showUserMenu ? 'expand_less' : 'expand_more'}
                            </span>
                        </button>

                        {/* User Menu Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-12 w-64 bg-card rounded-xl shadow-xl border border-border z-50 animate-fade-in overflow-hidden">
                                {/* User Info */}
                                <div className="px-4 py-4 border-b border-border bg-surface/50">
                                    <div className="flex items-center gap-3">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={displayName}
                                                referrerPolicy="no-referrer"
                                                className="rounded-full size-10 shrink-0 object-cover"
                                            />
                                        ) : (
                                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {initials}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-text-primary truncate">{displayName}</p>
                                            <p className="text-xs text-text-secondary truncate">{displayEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    {!pathname.startsWith('/employees-dashboard') && (
                                        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors text-left">
                                            <span className="material-symbols-outlined text-[20px] text-text-secondary">person</span>
                                            My Profile
                                        </button>
                                    )}
                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors text-left">
                                        <span className="material-symbols-outlined text-[20px] text-text-secondary">settings</span>
                                        Settings
                                    </button>
                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors text-left">
                                        <span className="material-symbols-outlined text-[20px] text-text-secondary">help</span>
                                        Help & Support
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="border-t border-border py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-accent-red hover:bg-accent-red/5 transition-colors text-left"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function formatTimeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
