'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

export function OTPInput({
    length = 6,
    value,
    onChange,
    disabled = false,
    autoFocus = true
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    // Auto focus first input on mount
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const handleChange = (index: number, digit: string) => {
        if (disabled) return;

        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newValue = value.split('');
        newValue[index] = digit;
        const result = newValue.join('').slice(0, length);
        onChange(result);

        // Move to next input if digit was entered
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
            setActiveIndex(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === 'Backspace') {
            e.preventDefault();
            if (value[index]) {
                // Clear current digit
                handleChange(index, '');
            } else if (index > 0) {
                // Move to previous input and clear it
                inputRefs.current[index - 1]?.focus();
                setActiveIndex(index - 1);
                handleChange(index - 1, '');
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
            setActiveIndex(index - 1);
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
            setActiveIndex(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (pastedData) {
            onChange(pastedData);
            // Focus the input after the pasted content (or last one)
            const nextIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[nextIndex]?.focus();
            setActiveIndex(nextIndex);
        }
    };

    const handleFocus = (index: number) => {
        setActiveIndex(index);
        // Select any existing content
        inputRefs.current[index]?.select();
    };

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }, (_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={`
                        w-12 h-14 text-center text-xl font-bold rounded-xl
                        bg-slate-100 dark:bg-slate-800
                        border-2 transition-all duration-200 outline-none
                        ${activeIndex === index
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900'
                            : 'border-transparent'
                        }
                        ${value[index] ? 'text-foreground' : 'text-muted-foreground'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                        focus:bg-white dark:focus:bg-slate-900
                    `}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}
