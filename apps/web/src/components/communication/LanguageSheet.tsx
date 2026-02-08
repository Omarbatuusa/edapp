import React from 'react';

interface LanguageSheetProps {
    isOpen: boolean;
    onClose: () => void;
    currentLanguage: string;
    onSelectLanguage: (lang: string) => void;
}

export function LanguageSheet({ isOpen, onClose, currentLanguage, onSelectLanguage }: LanguageSheetProps) {
    const LANGUAGES = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
        { code: 'zu', name: 'Zulu', native: 'isiZulu' },
        { code: 'xh', name: 'Xhosa', native: 'isiXhosa' },
        { code: 'st', name: 'Sotho', native: 'Sesotho' },
        { code: 'nso', name: 'Pedi', native: 'Sepedi' },
        { code: 'tn', name: 'Tswana', native: 'Setswana' },
        { code: 'ts', name: 'Tsonga', native: 'Xitsonga' },
        { code: 'ss', name: 'Swati', native: 'SiSwati' },
        { code: 've', name: 'Venda', native: 'Tshivenda' },
        { code: 'nr', name: 'Ndebele', native: 'isiNdebele' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="bg-background border-t border-border w-full max-w-md rounded-t-3xl sm:rounded-2xl sm:border max-h-[85vh] flex flex-col relative z-10 shadow-xl animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-secondary rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

                <div className="px-6 pb-2 border-b border-border/50">
                    <h2 className="text-xl font-bold">Language Preferences</h2>
                    <p className="text-sm text-muted-foreground mt-1">Select your preferred language for auto-translation.</p>
                </div>

                <div className="p-4 overflow-y-auto space-y-2">
                    {LANGUAGES.map(lang => {
                        const isSelected = currentLanguage === lang.name;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onSelectLanguage(lang.name);
                                    onClose();
                                }}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${isSelected
                                    ? 'bg-primary/5 border-primary shadow-sm'
                                    : 'bg-card border-border hover:bg-secondary/50'
                                    }`}
                            >
                                <div className="flex flex-col items-start">
                                    <span className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{lang.name}</span>
                                    <span className="text-xs text-muted-foreground">{lang.native}</span>
                                </div>
                                {isSelected && (
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-border/50 bg-secondary/10">
                    <button
                        onClick={onClose}
                        className="w-full py-3 font-bold text-primary bg-background border border-border rounded-xl hover:bg-secondary/50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
