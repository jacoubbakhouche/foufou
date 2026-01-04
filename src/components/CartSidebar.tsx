import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
    const { items, total, removeFromCart, updateQuantity, isOpen, setIsOpen } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsOpen(false);
        navigate('/checkout');
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary">
                    <ShoppingCart className="h-5 w-5 text-foreground" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white animate-scale-in">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[400px] flex flex-col p-0 border-r-4 border-primary/20 rounded-r-[3rem] overflow-hidden">
                <SheetHeader className="p-6 border-b border-primary/10 bg-primary/5">
                    <SheetTitle className="flex items-center justify-center gap-3 text-2xl font-black text-primary">
                        <span className="text-3xl">🛒</span>
                        {t('yourCart')}
                        <span className="text-3xl">✨</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 flex flex-col h-full overflow-hidden bg-background/50 backdrop-blur-sm">
                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-secondary/10">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                                <span className="text-5xl">🥺</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2 text-primary">{t('emptyCart')}</h3>
                            <p className="text-muted-foreground mb-8 text-lg font-medium">
                                {t('continueShopping')}
                            </p>
                            <Button onClick={() => setIsOpen(false)} variant="outline" className="w-full max-w-[200px] rounded-full h-12 text-lg border-2 hover:bg-primary hover:text-white transition-all">
                                🛍️ {t('continueShopping')}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 bg-white dark:bg-card rounded-3xl p-3 border border-primary/10 shadow-sm animate-scale-in hover:shadow-md transition-all">
                                            <div className="relative h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                                <img
                                                    src={item.product.images?.[0] || item.product.image}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                <div>
                                                    <h4 className="font-bold text-lg leading-tight truncate pr-4 text-primary">{item.product.name}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 font-medium bg-secondary/50 w-fit px-2 py-1 rounded-full">
                                                        🎨 {item.selectedColor} • 📏 {item.selectedSize}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1 bg-secondary rounded-full p-1 shadow-inner">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full bg-white shadow-sm hover:scale-110 transition-transform"
                                                            onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, Math.max(0, item.quantity - 1))}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full bg-white shadow-sm hover:scale-110 transition-transform text-primary"
                                                            onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                        onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="p-6 border-t bg-white/50 dark:bg-black/20 backdrop-blur-md">
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between font-black text-xl">
                                        <span>{t('total')}</span>
                                        <span className="text-primary">{total} {t('currency')}</span>
                                    </div>
                                </div>
                                <Button onClick={handleCheckout} className="w-full h-14 text-xl font-black shadow-xl shadow-primary/20 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] transition-transform" variant="gold">
                                    ✨ {t('checkout')} ➡️
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CartSidebar;
