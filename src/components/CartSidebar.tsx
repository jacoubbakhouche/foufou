import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const CartSidebar = () => {
    const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();
    const navigate = useNavigate();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-primary transition-colors"
                    title="سلة المشتريات"
                >
                    <ShoppingBag className="h-6 w-6" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-scale-in border-2 border-background">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md flex flex-col p-0 bg-background/95 backdrop-blur-lg border-r border-border">
                <SheetHeader className="px-6 py-4 border-b border-border/40">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        سلة المشتريات
                        <span className="text-sm font-normal text-muted-foreground mr-auto bg-secondary px-2 py-0.5 rounded-full">
                            {itemCount} منتج
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                            <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-2">
                                <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">السلة فارغة</h3>
                                <p className="text-sm text-muted-foreground">لم تقم بإضافة أي منتجات للسلة بعد</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 py-6">
                            {items.map((item) => (
                                <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 group">
                                    {/* Product Image */}
                                    <div className="w-20 h-24 rounded-lg overflow-hidden border border-border bg-secondary/10 flex-shrink-0">
                                        <img
                                            src={item.product.images?.[0] || item.product.image}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-sm line-clamp-2 leading-relaxed">
                                                {item.product.name}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                                {item.selectedColor && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full border" style={{ backgroundColor: item.selectedColor }} />
                                                        {item.selectedColor}
                                                    </span>
                                                )}
                                                {item.selectedSize && (
                                                    <span className="bg-secondary px-1.5 rounded">
                                                        {item.selectedSize}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 bg-secondary/30 rounded-lg p-1 border border-border/50">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-primary">
                                                    {item.product.price * item.quantity} د.ج
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                                        className="text-muted-foreground hover:text-destructive transition-colors self-start p-1"
                                        title="حذف المنتج"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-border bg-secondary/5 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">المجموع الفرعي</span>
                                <span className="font-medium">{total} د.ج</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-2 text-primary">
                                <span>الإجمالي</span>
                                <span>{total} د.ج</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-lg font-bold bg-gradient-gold hover:opacity-90 transition-all shadow-gold"
                            onClick={() => navigate('/checkout')}
                        >
                            <span>إتمام الطلب</span>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartSidebar;
