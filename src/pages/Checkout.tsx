import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, User, Phone, MapPin, ShoppingBag, Truck, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { getShippingRate, isStopDeskAvailable } from '@/constants/shipping-rates';
import { supabase } from '@/integrations/supabase/client';
import LocationPicker from '@/components/LocationPicker';
import CommunePicker from '@/components/CommunePicker';
import { cn } from '@/lib/utils';

const Checkout = () => {
  const { items, total, clearCart, updateQuantity, updateCartAttributes, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: 'Home Delivery', // Using 'address' field to store Delivery Type for compatibility
  });

  const [shippingCost, setShippingCost] = useState(0);

  // Update shipping cost when inputs change
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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.wilaya || !formData.commune || !formData.address) {
      toast.error('يرجى ملء جميع حقول التوصيل');
      return;
    }

    setIsSubmitting(true);

    const subtotal = total;
    const totalAmount = subtotal + shippingCost;

    // Prepare items for DB
    const orderItems = items.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images?.[0] || item.product.image
      },
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize
    }));

    const orderData = {
      customer_name: formData.name,
      phone: formData.phone,
      address: `${formData.wilaya} - ${formData.commune} - ${formData.address}`,
      items: orderItems,
      total: totalAmount,
      status: 'pending'
    };

    // Check stocks for all items (Simplified check, ideally should be transactional)
    for (const item of items) {
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product.id)
        .single();

      if (fetchError || !productData) {
        toast.error(`خطأ في التحقق من المنتجات: ${item.product.name}`);
        setIsSubmitting(false);
        return;
      }

      // Note: This check is simple. For multiple variants sharing stock, it's tricky.
      // Assuming stock_quantity is global for the product for now as per current DB schema.
      // If we have separate stocks per variant, we'd check that. 
      // Currently schema seems to have one stock_quantity per product row.
      if (productData.stock_quantity < item.quantity) {
        toast.error(`عذراً، الكمية المتوفرة من ${item.product.name} غير كافية (${productData.stock_quantity})`);
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase
      .from('orders')
      .insert([orderData]);

    setIsSubmitting(false);
    if (error) {
      toast.error('خطأ في إرسال الطلب، يرجى المحاولة مرة أخرى');
      console.error(error);
    } else {
      toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
      clearCart();
      navigate('/');
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <Header />

      <main className="container mx-auto px-2 md:px-4 pt-4 md:pt-8 max-w-6xl">
        <Button variant="ghost" className="mb-4 md:mb-6 gap-2 text-sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة للمتجر
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">

          {/* Checkout Form (Right Side on Desktop, Top on Mobile) */}
          <div className="order-1 lg:order-2">
            <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-border/50 shadow-lg relative overflow-hidden">

              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                ملخص الطلب
              </h2>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 items-start border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="h-24 w-24 rounded-xl overflow-hidden bg-white border shrink-0 relative">
                      <img
                        src={item.product.images?.[0] || item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                      {/* Quantity Badge/Control Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1 flex justify-center items-center gap-2">
                        <button
                          type="button"
                          className="text-white hover:text-red-400 disabled:opacity-50"
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <span className="text-lg font-bold w-4 flex justify-center">-</span>
                        </button>
                        <span className="text-white font-bold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          className="text-white hover:text-green-400"
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                        >
                          <span className="text-lg font-bold w-4 flex justify-center">+</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-base line-clamp-2 leading-tight pl-2">{item.product.name}</h3>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-bold text-primary">{item.product.price * item.quantity} د.ج</span>
                          <span className="text-[10px] text-muted-foreground">{item.product.price} / حبة</span>
                        </div>
                      </div>

                      {/* Edit Variant Controls */}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {/* Colors */}
                        {item.product.colors && item.product.colors.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground font-bold">اللون:</span>
                            <div className="flex -space-x-2 space-x-reverse overflow-x-auto pb-1 max-w-[120px] scrollbar-hide">
                              {item.product.colors.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => updateCartAttributes(
                                    { productId: item.product.id, color: item.selectedColor, size: item.selectedSize },
                                    { color: color, size: item.selectedSize }
                                  )}
                                  className={cn(
                                    "w-6 h-6 rounded-full border-2 transition-all shadow-sm focus:outline-none focus:ring-2 ring-primary ring-offset-1 flex-shrink-0",
                                    item.selectedColor === color ? "border-primary z-10 scale-110" : "border-white hover:z-10 hover:scale-110"
                                  )}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sizes */}
                        {item.product.sizes && item.product.sizes.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground font-bold">المقياس:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.product.sizes.map(size => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => updateCartAttributes(
                                    { productId: item.product.id, color: item.selectedColor, size: item.selectedSize },
                                    { color: item.selectedColor, size: size }
                                  )}
                                  className={cn(
                                    "px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all",
                                    item.selectedSize === size
                                      ? "bg-primary text-white border-primary shadow-sm"
                                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                  )}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 -mt-1 -ml-2"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>المجموع الفرعي:</span>
                  <span>{total} د.ج</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>السعر للتوصيل:</span>
                  <span className={shippingCost === 0 ? "text-green-500 font-bold" : ""}>
                    {formData.wilaya ? (shippingCost === 0 ? "مجاني" : `${shippingCost} د.ج`) : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black pt-4 border-t border-border">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{total + shippingCost} د.ج</span>
                </div>
              </div>
            </div>

            {/* Security Badge or Info */}
            <div className="bg-secondary/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-muted-foreground text-sm text-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>تسوق آمن 100% • الدفع عند الاستلام</span>
            </div>
          </div>

          {/* Checkout Form (Right Side on Desktop) */}
          <div className="order-1 lg:order-2">
            <div className="bg-card rounded-3xl p-6 lg:p-8 border border-border/50 shadow-lg relative overflow-hidden">
              {/* Decorative background blur */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="mb-8 relative">
                <h1 className="text-3xl font-black mb-2">إتمام الطلب 🚀</h1>
                <p className="text-muted-foreground">أكمل البيانات التالية لتأكيد طلبك</p>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-6 relative">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    الاسم الكامل
                  </Label>
                  <Input
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-background border-input/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    رقم الهاتف
                  </Label>
                  <Input
                    placeholder="0XXXXXXXXX"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    dir="ltr"
                    className="h-12 bg-background border-input/50 focus:border-primary text-right"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
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
                      <MapPin className="h-4 w-4 text-primary" />
                      البلدية
                    </Label>
                    <Input
                      placeholder="اكتب اسم البلدية"
                      value={formData.commune}
                      onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                      className="h-12 bg-background border-input/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <Label className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    نوع التوصيل
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, address: 'Home Delivery' }))}
                      className={cn(
                        "cursor-pointer border-2 rounded-2xl p-4 transition-all hover:border-primary/50 flex flex-col items-center justify-center gap-3 text-center h-28 relative overflow-hidden",
                        formData.address === 'Home Delivery' ? "border-primary bg-primary/5 shadow-md" : "border-border bg-background"
                      )}
                    >
                      {formData.address === 'Home Delivery' && (
                        <div className="absolute top-2 right-2 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", formData.address === 'Home Delivery' ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                        <Truck className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-sm">توصيل للمنزل</span>
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
                        "cursor-pointer border-2 rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-3 text-center h-28 relative overflow-hidden",
                        formData.address === 'Stop Desk' ? "border-primary bg-primary/5 shadow-md" : "border-border bg-background",
                        !isStopDeskAvailable(formData.wilaya) && formData.wilaya ? "opacity-50 grayscale cursor-not-allowed bg-secondary/30" : "hover:border-primary/50"
                      )}
                    >
                      {formData.address === 'Stop Desk' && (
                        <div className="absolute top-2 right-2 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                      {!isStopDeskAvailable(formData.wilaya) && formData.wilaya && (
                        <div className="absolute inset-x-0 bottom-0 bg-destructive/10 text-destructive text-[10px] font-bold py-1">
                          غير متوفر
                        </div>
                      )}
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", formData.address === 'Stop Desk' ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-sm">توصيل للمكتب</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-2xl mt-8"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      تأكيد الطلب
                      <span className="mr-2 text-sm bg-white/20 px-2 py-0.5 rounded-full">{total + shippingCost} د.ج</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
