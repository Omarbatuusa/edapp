import React from 'react';
import { FeedItem } from './types';

export function ChannelInfoView({ item, onClose }: { item: FeedItem | null, onClose: () => void }) {
    if (!item) return null;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B1120] animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-md border-b border-border/50">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="font-bold text-lg">Contact Info</span>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe">
                {/* Profile Section */}
                <div className="flex flex-col items-center pt-8 pb-6 px-4 border-b border-border/50">
                    <img src={item.senderAvatar || 'https://ui-avatars.com/api/?name=School+Admin'} alt="" className="w-24 h-24 rounded-full mb-4 shadow-sm" />
                    <h2 className="text-xl font-bold text-center">{item.title || 'School Admin'}</h2>
                    <p className="text-muted-foreground text-sm">{item.role || 'Staff Member'}</p>

                    {/* Action Grid */}
                    <div className="grid grid-cols-4 gap-4 mt-6 w-full max-w-sm">
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">Search</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">notifications_off</span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">Mute</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">Add</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">Share</span>
                        </button>
                    </div>
                </div>

                {/* Details List */}
                <div className="p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 px-1">Details</h3>
                        <div className="space-y-1 bg-card border border-border/50 rounded-xl overflow-hidden">
                            <div className="flex justify-between items-center p-3 border-b border-border/50 bg-secondary/30">
                                <span className="text-sm font-medium">SLA Target</span>
                                <span className="text-sm text-muted-foreground">24 Hours</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border-b border-border/50 bg-secondary/30">
                                <span className="text-sm font-medium">Category</span>
                                <span className="text-sm text-muted-foreground">Academic</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary/30">
                                <span className="text-sm font-medium">Priority</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">NORMAL</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-3 px-1">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase">Media & Docs</h3>
                            <button className="text-xs text-primary font-bold">See All</button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-24 h-24 shrink-0 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground relative overflow-hidden group">
                                    {i === 1 ? (
                                        <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl">image</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 hidden group-hover:flex items-center justify-center transition-all">
                                        <span className="material-symbols-outlined text-white">visibility</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
