import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { ChevronLeft, ShoppingBag, ArrowRight, Share2, Check, User, Phone, MapPin, CheckCircle2, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LocationPicker from '@/components/LocationPicker';
import { getShippingRate, isStopDeskAvailable } from '@/constants/shipping-rates';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    // Order Form State
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        wilaya: '',
        commune: '',
        address: 'Home Delivery',
    });

    const [shippingCost, setShippingCost] = useState(0);

    // Update shipping cost when inputs change
    useEffect(() => {
        if (formData.wilaya) {
            // Reset to Home Delivery if Stop Desk is not available for selected wilaya
            if (formData.address === 'Stop Desk' && !isStopDeskAvailable(formData.wilaya)) {
                setFormData(prev => ({ ...prev, address: 'Home Delivery' }));
            }

            if (formData.address) {
                const cost = getShippingRate(formData.wilaya, formData.address);
                setShippingCost(cost);
            }
        }
    }, [formData.wilaya, formData.address]);

    useEffect(() => {
        if (id) {
            loadProduct(id);
        }
    }, [id]);

    const loadProduct = async (productId: string) => {
        setLoading(true);
        const data = await fetchProductById(productId);
        if (data) {
            setProduct(data);
            setMainImage(data.images[0] || '');
            setSelectedColor(data.colors[0] || '');
            setSelectedSize(data.sizes[0] || '');
        }
        setLoading(false);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط المنتج');
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!product) return;

        if (product.colors.length > 0 && !selectedColor) {
            toast.error('يرجى اختيار اللون');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (product.sizes.length > 0 && !selectedSize) {
            toast.error('يرجى اختيار المقاس');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!formData.name || !formData.phone || !formData.wilaya || !formData.commune || !formData.address) {
            toast.error('يرجى ملء جميع حقول التوصيل');
            return;
        }

        setIsSubmitting(true);

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
                selectedColor: selectedColor,
                selectedSize: selectedSize
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
            setIsSubmitting(false);
            return;
        }

        if (freshProduct.stock_quantity < quantity) {
            toast.error(`عذراً، الكمية المتوفرة حالياً: ${freshProduct.stock_quantity}`);
            setIsSubmitting(false);
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
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase
            .from('orders')
            .insert([orderData]);

        setIsSubmitting(false);
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
            console.error(error);
        } else {
            toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً لتأكيد الطلب');
            // Reset form
            setFormData({
                name: '',
                phone: '',
                wilaya: '',
                commune: '',
                address: '',
            });
            setQuantity(1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
                <Button asChild>
                    <Link to="/">العودة للمتجر</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            <Header />

            <main className="container mx-auto px-4 pt-6">
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link to="/">
                            <ArrowRight className="h-4 w-4" />
                            العودة للمتجر
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/30 relative shadow-xl border">
                            {mainImage === product.video_url ? (
                                <video
                                    src={mainImage}
                                    controls
                                    className="w-full h-full object-contain bg-black"
                                    autoPlay
                                />
                            ) : (
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
                                    onClick={() => setIsZoomOpen(true)}
                                />
                            )}
                            {!product.inStock && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <Badge variant="destructive" className="text-xl px-6 py-2">نفذت الكمية</Badge>
                                </div>
                            )}
                        </div>

                        {(product.images.length > 1 || product.video_url) && (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={cn(
                                            "aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white",
                                            mainImage === img ? "border-primary shadow-md scale-95" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                                    </button>
                                ))}
                                {product.video_url && (
                                    <button
                                        onClick={() => setMainImage(product.video_url!)}
                                        className={cn(
                                            "aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white relative group",
                                            mainImage === product.video_url ? "border-primary shadow-md scale-95" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <div className="w-full h-full bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
                                            <video src={product.video_url} className="w-full h-full object-cover opacity-60" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Product Info & Order Form */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <Badge variant="outline" className="mb-2 text-primary border-primary/20 bg-primary/5 uppercase tracking-wider">{product.category}</Badge>
                            <h1 className="text-3xl md:text-4xl font-black mb-3 text-foreground leading-tight">{product.name}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-primary">{product.price} د.ج</span>
                                {product.originalPrice && (
                                    <span className="text-xl text-muted-foreground line-through opacity-60">
                                        {product.originalPrice} د.ج
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8 flex-1">
                            {/* Colors */}
                            {product.colors.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        اللون المحدد: <span className="text-muted-foreground text-sm font-medium">{selectedColor}</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={cn(
                                                    "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center relative",
                                                    selectedColor === color ? "border-primary scale-110 shadow-lg" : "border-transparent hover:scale-105"
                                                )}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            >
                                                {selectedColor === color && <Check className="h-5 w-5 text-white drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {product.sizes.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3">اختر المقاس</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={cn(
                                                    "px-6 py-2.5 rounded-xl border-2 transition-all font-bold text-sm",
                                                    selectedSize === size
                                                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                        : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <h3 className="text-lg font-bold mb-3">الكمية</h3>
                                <div className="flex items-center gap-4 bg-background rounded-xl border p-1 shadow-sm w-fit">
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



                            {/* ----------------- ORDER FORM ----------------- */}
                            <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50 mt-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">معلومات التوصيل</h3>
                                        <p className="text-sm text-muted-foreground">أدخل معلوماتك لإتمام الطلب</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitOrder} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            الاسم الكامل
                                        </Label>
                                        <Input
                                            placeholder="أدخل اسمك الكامل"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-background"
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
                                            className="bg-background text-right"
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
                                                placeholder="أدخل البلدية"
                                                value={formData.commune}
                                                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            نوع التوصيل
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
                                                <span className="font-bold text-xs">توصيل للمنزل</span>
                                            </div>

                                            <div
                                                onClick={() => {
                                                    if (isStopDeskAvailable(formData.wilaya)) {
                                                        setFormData(prev => ({ ...prev, address: 'Stop Desk' }));
                                                    } else {
                                                        if (formData.wilaya) toast.error('توصيل للمكتب غير متوفر لهذه الولاية');
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
                                                <span className="font-bold text-xs">توصيل للمكتب</span>
                                            </div>
                                        </div>
                                        {formData.address === 'Stop Desk' && (
                                            <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border text-center">
                                                يرجى استلام طلبك من المكتب الأقرب إليك
                                            </p>
                                        )}
                                    </div>





                                    {/* Order Summary in Form */}
                                    <div className="bg-secondary/30 rounded-xl p-4 mt-6 border border-border/50 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">سعر المنتج:</span>
                                            <span className="font-medium">{product.price * quantity} د.ج</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">التوصيل:</span>
                                            <span className="font-medium text-blue-600">
                                                {shippingCost > 0 ? `+ ${shippingCost} د.ج` : 'اختر الولاية'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-2">
                                            <span className="font-bold text-lg">المجموع الكلي:</span>
                                            <span className="font-bold text-xl text-primary">{(product.price * quantity) + shippingCost} د.ج</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-500/10 px-2 py-1 rounded w-fit mt-2">
                                            <CheckCircle2 className="h-3 w-3" />
                                            توصيل سريع 58 ولاية
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full h-14 text-xl font-bold bg-gradient-gold hover:opacity-90 transform active:scale-95 transition-all shadow-xl mt-4"
                                        disabled={!product.inStock || isSubmitting}
                                        type="submit"
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <ShoppingBag className="ml-2 h-6 w-6" />
                                                {product.inStock ? 'تأكيد الطلب الآن' : 'نفذت الكمية'}
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-primary mt-2"
                                            disabled={!product.inStock}
                                            onClick={() => {
                                                if (!selectedColor && product.colors.length > 0) {
                                                    toast.error('يرجى اختيار اللون');
                                                    return;
                                                }
                                                if (!selectedSize && product.sizes.length > 0) {
                                                    toast.error('يرجى اختيار المقاس');
                                                    return;
                                                }
                                                addToCart(product, selectedColor, selectedSize);
                                            }}
                                        >
                                            أو أضف للسلة وأكمل التسوق
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section - Moved to Bottom */}
                <div className="mt-16 bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
                        <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
                        وصف المنتج
                    </h3>
                    <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-loose">
                        {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                    </div>
                </div>
            </main>

            {/* Image Zoom Modal */}
            {isZoomOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <button
                        onClick={() => setIsZoomOpen(false)}
                        className="absolute top-4 right-4 text-white hover:text-primary p-2 transition-colors"
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
