import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LocationPicker from '@/components/LocationPicker';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useLanguage } from '@/context/LanguageContext';
import { getShippingRate, isStopDeskAvailable } from '@/constants/shipping-rates';

interface OrderModalProps {
    product: Product;
    selectedColor: string;
    selectedSize: string;
    isOpen: boolean;
    onClose: () => void;
}

const OrderModal = ({ product, selectedColor, selectedSize, isOpen, onClose }: OrderModalProps) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [localColor, setLocalColor] = useState(selectedColor);
    const [localSize, setLocalSize] = useState(selectedSize);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setLocalColor(selectedColor);
            setLocalSize(selectedSize);
            setQuantity(1);
        }
    }, [isOpen, selectedColor, selectedSize]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        wilaya: '',
        commune: '',
        address: 'Home Delivery', // Default
    });

    const [shippingCost, setShippingCost] = useState(0);

    // Update shipping cost
    useEffect(() => {
        if (formData.wilaya) {
            if (formData.address === 'Stop Desk' && !isStopDeskAvailable(formData.wilaya)) {
                setFormData(prev => ({ ...prev, address: 'Home Delivery' }));
            }

            if (formData.address) {
                const cost = getShippingRate(formData.wilaya, formData.address);
                setShippingCost(cost);
            }
        }
    }, [formData.wilaya, formData.address]);

    // Check if on Checkout page to pre-fill from Cart
    useEffect(() => {
        if (isOpen && window.location.pathname === '/checkout') {
            // Future-proofing: If we want to pre-fill from a saved profile
        }
    }, [isOpen]);

    const isHexColor = (color: string) => {
        return color.startsWith('#') || /^#[0-9A-F]{6}$/i.test(color);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (product.colors.length > 0 && !localColor) {
            toast.error('يرجى اختيار اللون');
            return;
        }
        if (product.sizes.length > 0 && !localSize) {
            toast.error('يرجى اختيار المقاس');
            return;
        }

        if (!formData.name || !formData.phone || !formData.wilaya || !formData.commune || !formData.address) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        const total = (product.price * quantity) + shippingCost;
        const orderData = {
            customer_name: formData.name,
            phone: formData.phone,
            address: `${formData.wilaya} - ${formData.commune} - ${formData.address}`,
            items: [{
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0] || product.image
                },
                quantity: quantity,
                selectedColor: localColor,
                selectedSize: localSize
            }],
            total: total,
            status: 'pending'
        };

        // Check and update stock
        const { data: freshProductData, error: fetchError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', product.id)
            .single();

        const freshProduct = freshProductData as any;

        if (fetchError || !freshProduct) {
            toast.error('خطأ في التحقق من التوفر');
            return;
        }

        if (freshProduct.stock_quantity < quantity) {
            toast.error(`عذراً، الكمية المتوفرة حالياً: ${freshProduct.stock_quantity}`);
            return;
        }

        // Deduct stock
        const newStock = freshProduct.stock_quantity - quantity;
        const { error: updateError } = await supabase
            .from('products')
            .update({
                stock_quantity: newStock,
                in_stock: newStock > 0
            })
            .eq('id', product.id);

        if (updateError) {
            toast.error('خطأ في تحديث المخزون');
            return;
        }

        const { error } = await supabase
            .from('orders')
            .insert([orderData]);

        setLoading(false);
        if (error) {
            // Revert stock update
            await supabase
                .from('products')
                .update({
                    stock_quantity: (freshProduct.stock_quantity),
                    in_stock: freshProduct.stock_quantity > 0
                })
                .eq('id', product.id);

            toast.error('خطأ في إرسال الطلب، يرجى المحاولة مرة أخرى');
        } else {
            toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Package className="h-6 w-6 text-primary" />
                        تأكيد الطلب
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Product Summary */}
                    <div className="bg-secondary/50 p-4 rounded-xl space-y-4">
                        <div className="flex gap-4 items-center">
                            <img src={product.images?.[0] || product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg shadow-sm border" />
                            <div className="flex-1">
                                <h4 className="font-bold text-lg">{product.name}</h4>
                                <p className="text-primary font-bold text-xl">{product.price} د.ج</p>
                            </div>
                        </div>

                        {/* Options Selection inside Modal */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                            {product.colors.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">اللون</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setLocalColor(color)}
                                                className={cn(
                                                    "w-7 h-7 rounded-full border transition-all",
                                                    localColor === color ? "ring-2 ring-primary ring-offset-1 scale-110" : "opacity-70"
                                                )}
                                                style={{ backgroundColor: isHexColor(color) ? color : undefined }}
                                                title={color}
                                            >
                                                {!isHexColor(color) && <span className="text-[8px] flex items-center justify-center h-full">{color}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.sizes.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">المقاس</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setLocalSize(size)}
                                                className={cn(
                                                    "px-2 py-1 text-[10px] rounded border transition-all font-bold",
                                                    localSize === size ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity Selection */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div>
                                <Label className="text-sm font-bold">الكمية</Label>
                                <p className="text-xs text-muted-foreground">كم حبة تريد من هذا المنتج؟</p>
                            </div>
                            <div className="flex items-center gap-4 bg-background rounded-xl border p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-xl font-bold"
                                >
                                    -
                                </button>
                                <span className="text-xl font-bold min-w-[30px] text-center">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-xl font-bold text-primary"
                                >
                                    +
                                </button>
                            </div>
                        </div>



                        // ... inside handleSubmit ...
                        const total = (product.price * quantity) + shippingCost;
                        // ...

                        // ... inside render Summary block ...
                        {/* Order Total Summary */}
                        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">سعر الوحدة:</span>
                                <span className="font-medium">{product.price} د.ج</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">الكمية:</span>
                                <span className="font-medium">× {quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">التوصيل:</span>
                                <span className="font-medium text-blue-600">{shippingCost > 0 ? `+ ${shippingCost} د.ج` : '-'}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black border-t border-primary/20 pt-1 mt-1 text-primary">
                                <span>الإجمالي:</span>
                                <span>{(product.price * quantity) + shippingCost} د.ج</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                الاسم الكامل
                            </Label>
                            <Input
                                placeholder="أدخل اسمك الكامل"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                رقم الهاتف
                            </Label>
                            <Input
                                placeholder="0XXXXXXXXX"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                dir="ltr"
                            />
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    الولاية
                                </Label>
                                <LocationPicker
                                    value={formData.wilaya}
                                    onChange={(wilaya) => setFormData({ ...formData, wilaya })}
                                    placeholder="اختر الولاية"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    البلدية
                                </Label>
                                <Input
                                    placeholder="أدخل البلدية ضمناً"
                                    value={formData.commune}
                                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {t ? t('deliveryType') : 'نوع التوصيل'}
                            </Label>

                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, address: 'Home Delivery' }))}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-xl p-3 transition-all hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-center h-24",
                                        formData.address === 'Home Delivery' ? "border-primary bg-primary/5" : "border-border"
                                    )}
                                >
                                    <div className={cn("w-5 h-5 rounded-full border border-primary flex items-center justify-center", formData.address === 'Home Delivery' ? "bg-primary" : "bg-transparent")}>
                                        {formData.address === 'Home Delivery' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-bold text-xs">{t ? t('homeDelivery') : 'توصيل للمنزل'}</span>
                                </div>

                                <div
                                    onClick={() => {
                                        if (isStopDeskAvailable(formData.wilaya)) {
                                            setFormData(prev => ({ ...prev, address: 'Stop Desk' }));
                                        } else {
                                            if (formData.wilaya) toast.error(t ? 'خدمة Stop Desk غير متوفرة لهذه الولاية' : 'توصيل للمكتب غير متوفر لهذه الولاية');
                                            else toast.error('يرجى اختيار الولاية أولاً');
                                        }
                                    }}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-xl p-3 transition-all flex flex-col items-center justify-center gap-2 text-center h-24 relative",
                                        formData.address === 'Stop Desk' ? "border-primary bg-primary/5" : "border-border",
                                        !isStopDeskAvailable(formData.wilaya) && formData.wilaya ? "opacity-50 grayscale cursor-not-allowed bg-secondary/50" : "hover:border-primary/50"
                                    )}
                                >
                                    {!isStopDeskAvailable(formData.wilaya) && formData.wilaya && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <span className="bg-background/90 text-destructive text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-destructive/20 translate-y-8">غير متوفر</span>
                                        </div>
                                    )}
                                    <div className={cn("w-5 h-5 rounded-full border border-primary flex items-center justify-center", formData.address === 'Stop Desk' ? "bg-primary" : "bg-transparent")}>
                                        {formData.address === 'Stop Desk' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-bold text-xs">{t ? t('stopDeskDelivery') : 'توصيل للمكتب'}</span>
                                </div>
                            </div>

                            {formData.address === 'Stop Desk' && (
                                <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border text-center">
                                    {t ? t('stopDeskLabel') : 'يرجى استلام طلبك من المكتب الأقرب إليك'}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full h-12 text-lg bg-gradient-gold hover:opacity-90 transition-opacity"
                    >
                        {loading ? 'جاري الإرسال...' : 'تأكيد الطلب الآن'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        الدفع عند الاستلام - توصيل سريع
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OrderModal;
