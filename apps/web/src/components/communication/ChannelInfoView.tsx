'use client';

import React from 'react';
import { FeedItem } from './types';

export function ChannelInfoView({ item, onClose }: { item: FeedItem | null; onClose: () => void }) {
    if (!item) return null;

    const avatarUrl = item.senderAvatar
        || (typeof item.source === 'object' ? item.source?.avatar : undefined)
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'U')}&background=random&size=200`;

    const subtitle = (typeof item.source === 'object' ? (item.source?.role || item.source?.name) : item.source)
        || item.role || 'Staff Member';

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21]">
            {/* Header */}
            <div className="shrink-0 bg-[#008069] dark:bg-[#202c33] text-white">
                <div className="flex items-center px-2 h-14 gap-3">
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0">
                        <span className="material-symbols-outlined text-white text-[22px]">arrow_back</span>
                    </button>
                    <span className="font-semibold text-[17px]">Contact Info</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Profile card */}
                <div className="bg-white dark:bg-[#202c33] flex flex-col items-center pt-8 pb-6 px-4 mb-2 shadow-sm">
                    <img src={avatarUrl} alt={item.title} className="w-28 h-28 rounded-full object-cover shadow-md mb-4" />
                    <h2 className="text-[22px] font-semibold text-[#111b21] dark:text-[#e9edef] text-center">{item.title}</h2>
                    <p className="text-[14px] text-[#667781] dark:text-[#8696a0] mt-0.5">{subtitle}</p>
                    {item.childName && (
                        <p className="text-[13px] text-[#667781] dark:text-[#8696a0] mt-0.5">Student: {item.childName}</p>
                    )}

                    {/* Action row */}
                    <div className="flex items-center gap-8 mt-6">
                        {[
                            { icon: 'call', label: 'Audio' },
                            { icon: 'search', label: 'Search' },
                            { icon: 'notifications_off', label: 'Mute' },
                        ].map(({ icon, label }) => (
                            <button key={icon} type="button" className="flex flex-col items-center gap-1.5">
                                <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[#00a884]">
                                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                                </div>
                                <span className="text-[11px] font-medium text-[#00a884]">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className="bg-white dark:bg-[#202c33] px-6 py-4 mb-2 shadow-sm">
                    <p className="text-[13px] text-[#667781] dark:text-[#8696a0] mb-1">About</p>
                    <p className="text-[15px] text-[#111b21] dark:text-[#e9edef]">{subtitle}</p>
                </div>

                {/* Details */}
                <div className="bg-white dark:bg-[#202c33] px-6 py-3 mb-2 shadow-sm">
                    <div className="flex items-center gap-4 py-3 border-b border-[#e9edef] dark:border-[#2a3942]">
                        <span className="material-symbols-outlined text-[22px] text-[#8696a0]">schedule</span>
                        <div>
                            <p className="text-[15px] text-[#111b21] dark:text-[#e9edef]">SLA Target</p>
                            <p className="text-[13px] text-[#667781] dark:text-[#8696a0]">24 Hours</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 py-3 border-b border-[#e9edef] dark:border-[#2a3942]">
                        <span className="material-symbols-outlined text-[22px] text-[#8696a0]">category</span>
                        <div>
                            <p className="text-[15px] text-[#111b21] dark:text-[#e9edef]">Category</p>
                            <p className="text-[13px] text-[#667781] dark:text-[#8696a0]">Academic</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 py-3">
                        <span className="material-symbols-outlined text-[22px] text-[#8696a0]">flag</span>
                        <div>
                            <p className="text-[15px] text-[#111b21] dark:text-[#e9edef]">Priority</p>
                            <p className="text-[13px] text-[#00a884] font-medium">{item.priority || 'NORMAL'}</p>
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white dark:bg-[#202c33] px-6 py-4 mb-2 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[14px] text-[#667781] dark:text-[#8696a0]">Media, links and docs</p>
                        <div className="flex items-center gap-1 text-[#8696a0]">
                            <span className="text-[13px]">0</span>
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-[100px] h-[100px] rounded bg-[#f0f2f5] dark:bg-[#2a3942] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[28px] text-[#8696a0]">{i === 1 ? 'description' : 'image'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-[#202c33] shadow-sm mb-2">
                    <button type="button" className="w-full flex items-center gap-5 px-6 py-4 text-left border-b border-[#e9edef] dark:border-[#2a3942]">
                        <span className="material-symbols-outlined text-[22px] text-[#8696a0]">block</span>
                        <span className="text-[15px] text-red-500">Block {item.title}</span>
                    </button>
                    <button type="button" className="w-full flex items-center gap-5 px-6 py-4 text-left">
                        <span className="material-symbols-outlined text-[22px] text-[#8696a0]">thumb_down</span>
                        <span className="text-[15px] text-red-500">Report {item.title}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
