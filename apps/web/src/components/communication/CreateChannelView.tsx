import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScreenStackBase } from './ScreenStack';

export function CreateChannelView({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<'broadcast' | 'chat'>('broadcast');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
        else onClose(); // Finish
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else onClose();
    };

    return (
        <ScreenStackBase>
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50">
                <div className="flex items-center px-4 h-14 gap-3">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-foreground">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold">Create Channel</h1>
                        <div className="flex gap-1 mt-0.5">
                            {[1, 2, 3, 4].map(s => (
                                <div
                                    key={s}
                                    className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-primary/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <StepType
                            key="step1"
                            type={type}
                            setType={setType}
                        />
                    )}
                    {step === 2 && (
                        <StepDetails
                            key="step2"
                            name={name}
                            setName={setName}
                            description={description}
                            setDescription={setDescription}
                        />
                    )}
                    {step === 3 && <StepAudience key="step3" />}
                    {step === 4 && <StepReview key="step4" type={type} name={name} />}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                <button
                    onClick={handleNext}
                    className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                    {step === totalSteps ? 'Create Channel' : 'Continue'}
                    <span className="material-symbols-outlined">{step === totalSteps ? 'check' : 'arrow_forward'}</span>
                </button>
            </div>
        </ScreenStackBase>
    );
}

function StepType({ type, setType }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">hub</span>
                </div>
                <h2 className="text-xl font-bold">Channel Type</h2>
                <p className="text-muted-foreground text-sm mt-1">How will people interact?</p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => setType('broadcast')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${type === 'broadcast' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-2xl text-primary">campaign</span>
                        <span className="font-bold">Broadcast</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-9">Only admins can post. Useful for announcements, newsletters, and alerts.</p>
                </button>

                <button
                    onClick={() => setType('chat')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${type === 'chat' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-2xl text-green-600">forum</span>
                        <span className="font-bold">Group Chat</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-9">Everyone can post. Good for class discussions, projects, and social groups.</p>
                </button>
            </div>
        </motion.div>
    );
}

function StepDetails({ name, setName, description, setDescription }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <label className="block text-sm font-bold mb-2">Channel Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grade 6 Parents"
                    className="w-full bg-secondary/50 border-0 rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary outline-none font-medium"
                />
            </div>
            <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this channel for?"
                    className="w-full bg-secondary/50 border-0 rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary outline-none resize-none h-32"
                />
            </div>
        </motion.div>
    );
}

function StepAudience() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <h2 className="text-xl font-bold mb-4">Add Members</h2>
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                        U{i}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-sm">User Name {i}</div>
                        <div className="text-xs text-muted-foreground">Parent • Grade 6</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked={i === 1} />
                </div>
            ))}
            <button className="w-full py-3 text-sm font-bold text-primary border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 mt-2">
                + Add by Role / Grade
            </button>
        </motion.div>
    );
}

function StepReview({ type, name }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="text-center py-8"
        >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in spin-in-12">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to Launch?</h2>
            <p className="text-muted-foreground mb-8 px-8">
                You are about to create the <strong>{name || 'New Channel'}</strong> {type}.
                Notifications will be sent to selected members.
            </p>

            <div className="bg-secondary/50 rounded-xl p-4 text-left text-sm space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-bold capitalize">{type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility</span>
                    <span className="font-bold">Private</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Moderation</span>
                    <span className="font-bold">Strict</span>
                </div>
            </div>
        </motion.div>
    );
}
