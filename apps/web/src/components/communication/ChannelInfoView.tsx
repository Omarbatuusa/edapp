'use client';

import React from 'react';
import { FeedItem } from './types';

export function ChannelInfoView({ item, onClose }: { item: FeedItem | null; onClose: () => void }) {
    if (!item) return null;

    const avatarUrl = item.senderAvatar
        || (typeof item.source === 'object' ? item.source?.avatar : undefined)
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'U')}&background=2563eb&color=fff&size=200`;

    const subtitle = (typeof item.source === 'object' ? (item.source?.role || item.source?.name) : item.source)
        || item.role || 'Staff Member';

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-[#f8fafc] dark:bg-[#0f172a]">
            {/* Header — Blue brand */}
            <div className="shrink-0 bg-[#2563eb] text-white">
                <div className="flex items-center px-2 h-14 gap-3">
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/15 shrink-0">
                        <span className="material-symbols-outlined text-white text-[22px]">arrow_back</span>
                    </button>
                    <span className="font-semibold text-[17px] text-white">Contact Info</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Profile card */}
                <div className="bg-white dark:bg-[#1e293b] flex flex-col items-center pt-8 pb-6 px-4 mb-2 shadow-sm">
                    <img src={avatarUrl} alt={item.title} className="w-28 h-28 rounded-full object-cover shadow-md mb-4" />
                    <h2 className="text-[22px] font-semibold text-[#0f172a] dark:text-[#f1f5f9] text-center">{item.title}</h2>
                    <p className="text-[14px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">{subtitle}</p>
                    {item.childName && (
                        <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">Student: {item.childName}</p>
                    )}

                    {/* Action row */}
                    <div className="flex items-center gap-8 mt-6">
                        {[
                            { icon: 'call', label: 'Audio' },
                            { icon: 'search', label: 'Search' },
                            { icon: 'notifications_off', label: 'Mute' },
                        ].map(({ icon, label }) => (
                            <button key={icon} type="button" className="flex flex-col items-center gap-1.5">
                                <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[#2563eb]">
                                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                                </div>
                                <span className="text-[11px] font-medium text-[#2563eb]">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className="bg-white dark:bg-[#1e293b] px-6 py-4 mb-2 shadow-sm">
                    <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] mb-1">About</p>
                    <p className="text-[15px] text-[#0f172a] dark:text-[#f1f5f9]">{subtitle}</p>
                </div>

                {/* Details */}
                <div className="bg-white dark:bg-[#1e293b] px-6 py-3 mb-2 shadow-sm">
                    <div className="flex items-center gap-4 py-3 border-b border-[#e2e8f0] dark:border-[#334155]">
                        <span className="material-symbols-outlined text-[22px] text-[#94a3b8]">schedule</span>
                        <div>
                            <p className="text-[15px] text-[#0f172a] dark:text-[#f1f5f9]">SLA Target</p>
                            <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8]">24 Hours</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 py-3 border-b border-[#e2e8f0] dark:border-[#334155]">
                        <span className="material-symbols-outlined text-[22px] text-[#94a3b8]">category</span>
                        <div>
                            <p className="text-[15px] text-[#0f172a] dark:text-[#f1f5f9]">Category</p>
                            <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8]">Academic</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 py-3">
                        <span className="material-symbols-outlined text-[22px] text-[#94a3b8]">flag</span>
                        <div>
                            <p className="text-[15px] text-[#0f172a] dark:text-[#f1f5f9]">Priority</p>
                            <p className="text-[13px] text-[#2563eb] font-medium">{item.priority || 'NORMAL'}</p>
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white dark:bg-[#1e293b] px-6 py-4 mb-2 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[14px] text-[#64748b] dark:text-[#94a3b8]">Media, links and docs</p>
                        <div className="flex items-center gap-1 text-[#94a3b8]">
                            <span className="text-[13px]">0</span>
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-[100px] h-[100px] rounded bg-[#f1f5f9] dark:bg-[#334155] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[28px] text-[#94a3b8]">{i === 1 ? 'description' : 'image'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-[#1e293b] shadow-sm mb-2">
                    <button type="button" className="w-full flex items-center gap-5 px-6 py-4 text-left border-b border-[#e2e8f0] dark:border-[#334155]">
                        <span className="material-symbols-outlined text-[22px] text-[#94a3b8]">block</span>
                        <span className="text-[15px] text-red-500">Block {item.title}</span>
                    </button>
                    <button type="button" className="w-full flex items-center gap-5 px-6 py-4 text-left">
                        <span className="material-symbols-outlined text-[22px] text-[#94a3b8]">thumb_down</span>
                        <span className="text-[15px] text-red-500">Report {item.title}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
