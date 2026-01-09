'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/api/useAuth';
import { authApi } from '@/services/api';
import { ChevronRight, Settings, ExternalLink, Clock as ClockIcon, Search, Check } from 'lucide-react';
import { getAllTimezones, TimezoneInfo, getIanaFromDescriptive } from '@/lib/timezones';

export const UtcClock: React.FC = () => {
    const { user } = useAuth();
    const [utcTime, setUtcTime] = useState<Date>(new Date());
    const [localTime, setLocalTime] = useState<Date>(new Date());
    const [isHovered, setIsHovered] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [timezones, setTimezones] = useState<TimezoneInfo[]>([]);
    const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC');
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            const now = new Date();
            setUtcTime(now);
            setLocalTime(now);
        }, 1000);

        // Fetch timezones from the internal utility
        const tzList = getAllTimezones();
        setTimezones(tzList);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user?.timezone) {
            setSelectedTimezone(user.timezone);
        }
    }, [user?.timezone]);

    const formatTime = (date: Date, tz: string) => {
        try {
            const ianaTz = getIanaFromDescriptive(tz);
            return new Intl.DateTimeFormat('en-US', {
                timeZone: ianaTz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }).format(date);
        } catch (e) {
            return date.toLocaleTimeString();
        }
    };

    const formatDate = (date: Date, tz: string) => {
        try {
            const ianaTz = getIanaFromDescriptive(tz);
            return new Intl.DateTimeFormat('en-US', {
                timeZone: ianaTz,
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            return date.toLocaleDateString();
        }
    };

    const handleTzChange = async (tzValue: string) => {
        setSelectedTimezone(tzValue);
        setIsDropdownOpen(false);
        setSearchQuery('');
        if (user) {
            try {
                await authApi.updateProfile({ timezone: tzValue });
            } catch (err) {
                console.error('Failed to update timezone:', err);
            }
        }
    };

    const filteredTimezones = timezones.filter(tz =>
        tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentTzLabel = timezones.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone;

    if (!mounted) return null;

    return (
        <div
            className={`fixed left-0 top-6 z-[9999] transition-all duration-500 transform ${isHovered ? 'translate-x-0' : '-translate-x-[calc(100%-24px)]'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowSettings(false); }}
        >
            <div className="flex items-start">
                {/* Content Card */}
                <div className="bg-white border-r-4 border-blue-600 shadow-2xl p-4 w-64 rounded-r-2xl border-y border-blue-50">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-3.5 h-3.5 text-blue-600" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Global Clock</h3>
                        </div>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-blue-500"
                        >
                            <Settings className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {showSettings ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                            <div className="relative">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Local Timezone</label>

                                {/* Custom Searchable Dropdown */}
                                <div className="mt-1 relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full text-left text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 hover:bg-white hover:border-blue-300 transition-all flex justify-between items-center group shadow-sm"
                                    >
                                        <span className="truncate pr-4 font-medium text-gray-700">
                                            {currentTzLabel}
                                        </span>
                                        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-100 rounded-xl shadow-2xl z-[10000] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                                            <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Search location..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                                                {filteredTimezones.length > 0 ? (
                                                    filteredTimezones.map(tz => (
                                                        <button
                                                            key={tz.value}
                                                            onClick={() => handleTzChange(tz.value)}
                                                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedTimezone === tz.value ? 'bg-blue-50/50 text-blue-700 font-bold' : 'text-gray-600'}`}
                                                        >
                                                            <span className="truncate">{tz.label}</span>
                                                            {selectedTimezone === tz.value && <Check className="w-3 h-3 text-blue-600" />}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-[10px] text-gray-400 italic">No timezones found</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full text-[10px] font-black text-blue-500 uppercase hover:bg-blue-50 py-2 rounded-lg transition-all"
                            >
                                Back to Clock
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* UTC Clock */}
                            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200 border border-blue-500">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-[10px] font-black text-white px-1.5 py-0.5 bg-blue-500/50 rounded uppercase tracking-tighter">UTC</span>
                                    <span className="text-[10px] text-blue-100 font-bold" suppressHydrationWarning={true}>{formatDate(utcTime, 'UTC')}</span>
                                </div>
                                <div className="text-2xl font-black text-white font-mono tracking-tighter" suppressHydrationWarning={true}>
                                    {formatTime(utcTime, 'UTC')}
                                </div>
                            </div>

                            {/* Local Clock */}
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-[10px] font-black text-gray-600 uppercase truncate max-w-[100px]" title={selectedTimezone}>
                                        {selectedTimezone.split('/').pop()?.replace(/_/g, ' ') || 'Local'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold" suppressHydrationWarning={true}>{formatDate(localTime, selectedTimezone)}</span>
                                </div>
                                <div className="text-2xl font-black text-gray-900 font-mono tracking-tighter" suppressHydrationWarning={true}>
                                    {formatTime(localTime, selectedTimezone)}
                                </div>
                            </div>

                            <a
                                href="https://www.utctime.net/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 text-[9px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-all group"
                            >
                                Reference: utctime.net
                                <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Arrow Grabber */}
                <div className={`w-8 h-16 mt-4 bg-blue-600 rounded-r-2xl shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${isHovered ? 'opacity-0 scale-95 translate-x-1' : 'opacity-100 scale-100 hover:w-10'}`}>
                    <ChevronRight className="w-6 h-6 text-white animate-bounce-x" />
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-x {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(3px); }
                }
                .animate-bounce-x {
                    animation: bounce-x 1s infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};
