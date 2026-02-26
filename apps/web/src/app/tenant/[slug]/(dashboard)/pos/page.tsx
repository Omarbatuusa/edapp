'use client';

import { useState } from 'react';
import { Search, ShoppingCart, User, X, CreditCard, Coffee, Lock } from 'lucide-react';

const PRODUCTS = [
    { id: 1, name: 'Chicken Burger', price: 45, category: 'Food', image: '🍔' },
    { id: 2, name: 'Veggie Wrap', price: 40, category: 'Food', image: '🌯' },
    { id: 3, name: 'Coke Zero', price: 15, category: 'Drinks', image: '🥤' },
    { id: 4, name: 'Still Water', price: 12, category: 'Drinks', image: '💧' },
    { id: 5, name: 'Apple', price: 5, category: 'Snacks', image: '🍎' },
    { id: 6, name: 'Chips', price: 10, category: 'Snacks', image: '🍟' },
];

export default function TuckshopPOS() {
    const [cart, setCart] = useState<any[]>([]);
    const [pinModalOpen, setPinModalOpen] = useState(false);

    const addToCart = (product: any) => {
        setCart([...cart, product]);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* Product Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))] pointer-events-none" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-[14px] bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] text-[15px] font-medium text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))/0.3] transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar scroll-smooth">
                        <CategoryFilter label="All" active />
                        <CategoryFilter label="Food" />
                        <CategoryFilter label="Drinks" />
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-1 snap-y">
                    {PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="ios-card p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[hsl(var(--admin-primary))] transition-all active:scale-[0.96] group snap-start"
                        >
                            <span className="text-[48px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform drop-shadow-sm">{product.image}</span>
                            <div className="text-center w-full">
                                <h3 className="font-bold text-[15px] tracking-tight text-[hsl(var(--admin-text-main))] truncate w-full px-1">{product.name}</h3>
                                <span className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] align-top">R {product.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full md:w-96 ios-card p-0 flex flex-col overflow-hidden h-full">
                <div className="p-5 border-b border-[hsl(var(--admin-border))] flex items-center justify-between bg-[hsl(var(--admin-surface-alt))]">
                    <div className="flex items-center gap-3 font-bold text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">
                        <ShoppingCart size={22} className="text-[hsl(var(--admin-primary))]" />
                        Current Order
                    </div>
                    <span className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))] bg-[hsl(var(--admin-surface))] px-3 py-1 rounded-full border border-[hsl(var(--admin-border))]">{cart.length} items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[hsl(var(--admin-surface))]">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[hsl(var(--admin-text-sub))] opacity-60">
                            <Coffee size={56} className="mb-4 text-[hsl(var(--admin-text-muted))]" />
                            <p className="font-semibold text-[15px]">Select items to add</p>
                        </div>
                    ) : (
                        cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3.5 bg-[hsl(var(--admin-surface-alt))] rounded-[16px] border border-[hsl(var(--admin-border))] animate-in slide-in-from-right-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[28px] bg-[hsl(var(--admin-surface))] p-2 rounded-[12px] shadow-sm">{item.image}</span>
                                    <div>
                                        <p className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))] tracking-tight">{item.name}</p>
                                        <p className="text-[14px] font-bold text-[hsl(var(--admin-primary))] mt-0.5">R {item.price}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(i)} className="w-8 h-8 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-danger))/0.1] hover:text-[hsl(var(--admin-danger))] transition-colors active:scale-95">
                                    <X size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-[hsl(var(--admin-surface-alt))] border-t border-[hsl(var(--admin-border))] mt-auto">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-[15px] font-semibold text-[hsl(var(--admin-text-sub))]">Total</span>
                        <span className="text-[32px] font-black tracking-tighter text-[hsl(var(--admin-text-main))]">R {total}.00</span>
                    </div>

                    <button
                        onClick={() => setPinModalOpen(true)}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-surface))] rounded-[16px] font-bold text-[17px] hover:bg-[hsl(var(--admin-text-main))/0.8] transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                        <CreditCard size={22} />
                        Checkout
                    </button>
                    <p className="text-[12px] font-medium text-center mt-4 text-[hsl(var(--admin-text-muted))] flex items-center justify-center gap-1.5"><Lock size={12} className="inline" /> Secure wallet transaction</p>
                </div>
            </div>

            {/* Mock PIN Modal */}
            {pinModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[hsl(var(--admin-surface))] w-full max-w-sm rounded-[32px] p-8 shadow-2xl flex flex-col items-center border border-[hsl(var(--admin-border))]">
                        <div className="w-20 h-20 bg-[hsl(var(--admin-primary))/0.1] rounded-full flex items-center justify-center text-[hsl(var(--admin-primary))] mb-6 shadow-sm">
                            <User size={40} />
                        </div>
                        <h2 className="text-[24px] font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-2">Student Verification</h2>
                        <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))] text-center mb-10">Ask student to enter their 4-digit PIN</p>

                        <div className="flex gap-4 mb-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setPinModalOpen(false);
                                setCart([]);
                                alert('Transaction Successful!');
                            }}
                            className="w-full py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CategoryFilter({ label, active }: any) {
    return (
        <button className={`px-5 py-2.5 rounded-[12px] text-[15px] font-semibold transition-all whitespace-nowrap shadow-sm active:scale-95 ${active ? 'bg-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-surface))]' : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface))]'}`}>
            {label}
        </button>
    )
}
