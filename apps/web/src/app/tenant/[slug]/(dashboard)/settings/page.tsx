'use client';

import { useState } from 'react';
import { User, Palette, Building, Save, Moon, Sun } from 'lucide-react';

export default function SettingsHub() {
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'profile'>('general');

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage tenant configuration and your personal profile.</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    <TabButton
                        active={activeTab === 'general'}
                        onClick={() => setActiveTab('general')}
                        icon={Building}
                        label="General"
                    />
                    <TabButton
                        active={activeTab === 'branding'}
                        onClick={() => setActiveTab('branding')}
                        icon={Palette}
                        label="Branding"
                    />
                    <div className="my-4 border-t border-border/50" />
                    <TabButton
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                        icon={User}
                        label="My Profile"
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 surface-card p-6 min-h-[400px]">
                    {activeTab === 'general' && <GeneralSettings />}
                    {activeTab === 'branding' && <BrandingSettings />}
                    {activeTab === 'profile' && <ProfileSettings />}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

function GeneralSettings() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold border-b border-border/40 pb-2">School Details</h2>

            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium mb-1">School Name</label>
                    <input type="text" defaultValue="Lakewood International Academy" className="w-full p-2 rounded-lg bg-secondary/30 border border-transparent focus:border-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input type="email" defaultValue="admin@lakewood.edu" className="w-full p-2 rounded-lg bg-secondary/30 border border-transparent focus:border-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input type="tel" defaultValue="+27 11 555 0123" className="w-full p-2 rounded-lg bg-secondary/30 border border-transparent focus:border-primary outline-none" />
                </div>

                <div className="pt-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

function BrandingSettings() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold border-b border-border/40 pb-2">Look & Feel</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Primary Brand Color</label>
                    <div className="flex gap-3">
                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                            <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform focus:border-foreground"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Select a color to update the tenant theme instantly.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Logo Upload</label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-secondary/10 transition-colors cursor-pointer">
                        <Building size={32} className="text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload new logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Display Mode</label>
                    <div className="flex gap-4 p-1 bg-secondary/20 rounded-lg inline-flex">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-background shadow-sm text-sm font-medium">
                            <Sun size={16} /> Light
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-background/50 text-muted-foreground text-sm font-medium">
                            <Moon size={16} /> Dark
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileSettings() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold border-b border-border/40 pb-2">My Profile</h2>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                    AD
                </div>
                <div>
                    <h3 className="font-bold text-lg">Admin User</h3>
                    <p className="text-muted-foreground">Super Administrator</p>
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <input type="text" defaultValue="Admin User" className="w-full p-2 rounded-lg bg-secondary/30 border border-transparent focus:border-primary outline-none" />
                </div>

                <div className="pt-4 border-t border-border/40">
                    <h3 className="text-sm font-bold mb-4">Security</h3>
                    <button className="text-sm text-primary hover:underline block mb-2">Change Password</button>
                    <button className="text-sm text-primary hover:underline block">Enable 2FA</button>
                </div>
            </div>
        </div>
    );
}
