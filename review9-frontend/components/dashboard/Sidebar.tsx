'use client';

import React from 'react';
import {
    Briefcase,
    LogOut,
    User as UserIcon,
    LayoutDashboard,
    BrainCircuit
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/api/useAuth';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();
    const { user } = useStore();

    if (!user) return null;

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
            active: pathname === '/dashboard'
        },
        {
            label: 'Profile',
            icon: UserIcon,
            path: '/profile',
            active: pathname === '/profile'
        }
    ];

    return (
        <aside className="w-20 lg:w-72 min-h-screen border-r border-gray-100 bg-white sticky top-0 flex flex-col transition-all duration-300 z-50">
            <div className="p-8 flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div className="hidden lg:block">
                    <span className="text-xl font-black tracking-tighter uppercase block leading-none">HireAI</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enterprise</span>
                </div>
            </div>

            <nav className="flex-grow px-6 space-y-2 mt-8">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => router.push(item.path)}
                        className={cn(
                            "w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all group",
                            item.active
                                ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                                : "text-gray-400 hover:text-slate-900 hover:bg-gray-50"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-black text-[11px] uppercase tracking-widest hidden lg:block">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-6 mt-auto border-t border-gray-50">
                <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-black text-[11px] uppercase tracking-widest hidden lg:block">Log Out</span>
                </button>
            </div>
        </aside>
    );
};
