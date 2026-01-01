import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '@/hooks/useProducts';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OrderModal from '@/components/OrderModal';
import Header from '@/components/Header';
import { ChevronLeft, ShoppingBag, ArrowRight, Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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
                            <img
                                src={mainImage}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            {!product.inStock && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <Badge variant="destructive" className="text-xl px-6 py-2">نفذت الكمية</Badge>
                                </div>
                            )}
                        </div>

                        {product.images.length > 1 && (
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
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <Badge variant="outline" className="mb-2 text-primary border-primary/20 bg-primary/5 uppercase tracking-wider">{product.category}</Badge>
                            <h1 className="text-3xl md:text-4xl font-black mb-3 text-foreground leading-tight">{product.name}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-primary">{product.price} ر.س</span>
                                {product.originalPrice && (
                                    <span className="text-xl text-muted-foreground line-through opacity-60">
                                        {product.originalPrice} ر.س
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

                            {/* Description */}
                            <div className="bg-secondary/20 p-6 rounded-2xl border border-border/50">
                                <h3 className="text-lg font-bold mb-3">وصف المنتج</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                                </p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-10 sticky bottom-4 lg:relative lg:bottom-0">
                            <Button
                                size="lg"
                                className="w-full h-14 text-xl font-bold bg-gradient-gold hover:opacity-90 transform active:scale-95 transition-all shadow-xl"
                                disabled={!product.inStock}
                                onClick={() => setIsOrderModalOpen(true)}
                            >
                                <ShoppingBag className="ml-2 h-6 w-6" />
                                {product.inStock ? 'اطلب الآن - الدفع عند الاستلام' : 'نفذت الكمية'}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {product && (
                <OrderModal
                    product={product}
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    isOpen={isOrderModalOpen}
                    onClose={() => setIsOrderModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProductDetail;
