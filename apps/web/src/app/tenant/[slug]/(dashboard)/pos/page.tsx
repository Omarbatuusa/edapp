'use client';

import { useState } from 'react';
import { Search, ShoppingCart, User, X, CreditCard, Coffee } from 'lucide-react';

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
        <div className="h-[calc(100vh-100px)] flex gap-6">
            {/* Product Grid */}
            <div className="flex-1 flex flex-col">
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/30 border-none focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <CategoryFilter label="All" active />
                        <CategoryFilter label="Food" />
                        <CategoryFilter label="Drinks" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
                    {PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="surface-card p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-all active:scale-95 group"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform">{product.image}</span>
                            <h3 className="font-bold text-center mt-2">{product.name}</h3>
                            <span className="text-sm font-medium text-muted-foreground">R {product.price}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 surface-card p-0 flex flex-col border-l border-border/50">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/10">
                    <div className="flex items-center gap-2 font-bold">
                        <ShoppingCart size={20} />
                        Current Order
                    </div>
                    <span className="text-xs text-muted-foreground">{cart.length} items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <Coffee size={48} className="mb-2" />
                            <p>Select items to add</p>
                        </div>
                    ) : (
                        cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg animate-in slide-in-from-right-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.image}</span>
                                    <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">R {item.price}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(i)} className="text-muted-foreground hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-secondary/10 border-t border-border/50">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-muted-foreground font-medium">Total</span>
                        <span className="text-3xl font-black">R {total}.00</span>
                    </div>

                    <button
                        onClick={() => setPinModalOpen(true)}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <CreditCard size={20} />
                        Checkout
                    </button>
                    <p className="text-xs text-center mt-3 text-muted-foreground">Secure transaction via Student Wallet</p>
                </div>
            </div>

            {/* Mock PIN Modal */}
            {pinModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-background w-full max-w-sm rounded-2xl p-8 shadow-2xl flex flex-col items-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                            <User size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Student Verification</h2>
                        <p className="text-muted-foreground text-center mb-8">Ask student to enter their 4-digit PIN</p>

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
        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-black text-white' : 'bg-secondary/50 hover:bg-secondary'}`}>
            {label}
        </button>
    )
}
