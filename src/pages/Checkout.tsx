import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, CheckCircle2, Phone, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save order to database
      const orderItems = items.map((item) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images?.[0] || item.product.image,
        },
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));

      const { error } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          items: orderItems,
          total: total,
          status: 'pending',
        }]);

      if (error) {
        toast.error('حدث خطأ أثناء إرسال الطلب');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    } catch {
      toast.error('حدث خطأ غير متوقع');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl shadow-card text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">سلتك فارغة</h2>
          <p className="text-muted-foreground mb-6">أضف بعض المنتجات قبل إتمام الطلب</p>
          <Button variant="gold" onClick={() => navigate('/')}>
            <ArrowRight className="h-4 w-4" />
            العودة للمتجر
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl shadow-card text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">تم استلام طلبك بنجاح!</h2>
          <p className="text-muted-foreground mb-6">
            سيتواصل معك فريقنا هاتفياً خلال دقائق لتأكيد الطلب وموعد التوصيل
          </p>
          <div className="bg-secondary/50 p-4 rounded-xl mb-6">
            <p className="text-sm text-muted-foreground">
              📞 احتفظ بهاتفك بالقرب منك
            </p>
          </div>
          <Button variant="gold" onClick={() => navigate('/')} className="w-full">
            <ArrowRight className="h-4 w-4" />
            العودة للمتجر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowRight className="h-4 w-4" />
          العودة للمتجر
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-card">
            <h1 className="text-2xl font-bold mb-6">إتمام الطلب</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="h-4 w-4 text-primary" />
                  الاسم الكامل
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل اسمك الكامل"
                  className="h-12"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  رقم الهاتف
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05xxxxxxxx"
                  className="h-12"
                  dir="ltr"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  عنوان التوصيل
                </label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="المدينة، الحي، الشارع، رقم المنزل..."
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    جاري الإرسال...
                  </span>
                ) : (
                  'تأكيد الطلب'
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              💳 الدفع نقداً عند الاستلام - لا توجد رسوم إضافية
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-card h-fit">
            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-3"
                >
                  <img
                    src={item.product.images?.[0] || item.product.image}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.selectedColor} • {item.selectedSize} • الكمية: {item.quantity}
                    </p>
                    <p className="text-primary font-semibold mt-1">
                      {item.product.price * item.quantity} ر.س
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{total} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التوصيل</span>
                <span className="text-green-600 font-medium">مجاني</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>الإجمالي</span>
                <span className="text-primary">{total} ر.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
