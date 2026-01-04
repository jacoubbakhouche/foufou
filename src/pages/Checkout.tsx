import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, CheckCircle2, Phone, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { ALGERIA_DATA, getWilayas, getCommunesByWilaya, Wilaya, Commune } from '@/constants/algeria-data';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user to auto-fill
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: 'Home Delivery', // Default to Home Delivery since field is removed
  });

  const wilayas = getWilayas();
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number | null>(null);
  const [communes, setCommunes] = useState<Commune[]>([]);

  // Auto-fill form if user is logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.full_name || '',
            phone: data.phone || '',
            wilaya: data.wilaya || '',
            commune: data.commune || '',
            address: data.address || ''
          }));
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  // Update communes when wilaya changes
  useEffect(() => {
    if (formData.wilaya) {
      const wilaya = wilayas.find(w => w.name === formData.wilaya || w.ar_name === formData.wilaya);
      if (wilaya) {
        setSelectedWilayaCode(wilaya.code);
        setCommunes(getCommunesByWilaya(wilaya.code));
      }
    }
  }, [formData.wilaya]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.wilaya || !formData.commune) {
      toast.error(t('fillAllFields'));
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

      // 1. Check and deduct stock for ALL items first
      for (const item of items) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product.id)
          .single();

        if (productError || !productData) {
          throw new Error(t('errorCheckingProductAvailability', { productName: item.product.name }));
        }

        if (productData.stock_quantity < item.quantity) {
          throw new Error(t('outOfStock', { productName: item.product.name, availableQuantity: productData.stock_quantity }));
        }

        const newStock = productData.stock_quantity - item.quantity;
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: newStock,
            in_stock: newStock > 0
          })
          .eq('id', item.product.id);

        if (updateError) {
          throw new Error(t('errorUpdatingStock', { productName: item.product.name }));
        }
      }

      const { error } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address, // Now stores only detailed address
          items: orderItems,
          total: total,
          status: 'pending',
          user_id: user?.id || null
        }]);

      if (error) {
        toast.error(t('errorSubmittingOrder'));
        // Ideally should rollback stock here, but simplified for now (admin can cancel to restore)
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || t('unexpectedError'));
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl shadow-card text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">{t('emptyCart')}</h2>
          <p className="text-muted-foreground mb-6">{t('continueShopping')}</p>
          <Button variant="gold" onClick={() => navigate('/')}>
            <ArrowRight className="h-4 w-4" />
            {t('backToStore')}
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
          <h2 className="text-2xl font-bold mb-2">{t('orderSuccess')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('orderSuccessMessage')}
          </p>
          <div className="bg-secondary/50 p-4 rounded-xl mb-6">
            <p className="text-sm text-muted-foreground">
              📞 {t('phoneKeepClose')}
            </p>
          </div>
          <Button variant="gold" onClick={() => navigate('/')} className="w-full">
            <ArrowRight className="h-4 w-4" />
            {t('backToStore')}
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
          {t('backToStore')}
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-card">
            <h1 className="text-2xl font-bold mb-6">{t('checkoutTitle')}</h1>

            {user && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 text-sm text-primary">
                {t('autoFill')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="h-4 w-4 text-primary" />
                  {t('fullName')}
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('fullNamePlaceholder')}
                  className="h-12"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  {t('phone')}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {t('wilaya')}
                  </label>
                  <Select
                    value={formData.wilaya}
                    onValueChange={(value) => {
                      const wilaya = wilayas.find(w => w.name === value);
                      setFormData(prev => ({ ...prev, wilaya: value, commune: '' }));
                      if (wilaya) {
                        setSelectedWilayaCode(wilaya.code);
                        setCommunes(getCommunesByWilaya(wilaya.code));
                      }
                    }}
                    required
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t('selectWilaya')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {wilayas.map((w) => (
                        <SelectItem key={w.code} value={w.name}>
                          {w.code} - {language === 'ar' ? w.ar_name : w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {t('commune')}
                  </label>
                  <Select
                    value={formData.commune}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, commune: value }))}
                    disabled={!selectedWilayaCode}
                    required
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t('selectCommune')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {communes.map((c) => (
                        <SelectItem key={c.code} value={c.name}>
                          {language === 'ar' ? c.ar_name : c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t('deliveryType')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, address: 'Home Delivery' }))}
                    className={cn(
                      "cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-primary/50",
                      formData.address === 'Home Delivery' ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-4 h-4 rounded-full border border-primary flex items-center justify-center", formData.address === 'Home Delivery' ? "bg-primary" : "bg-transparent")}>
                        {formData.address === 'Home Delivery' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-bold text-sm">{t('homeDelivery')}</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData(prev => ({ ...prev, address: 'Stop Desk' }))}
                    className={cn(
                      "cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-primary/50",
                      formData.address === 'Stop Desk' ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-4 h-4 rounded-full border border-primary flex items-center justify-center", formData.address === 'Stop Desk' ? "bg-primary" : "bg-transparent")}>
                        {formData.address === 'Stop Desk' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-bold text-sm">{t('stopDeskDelivery')}</span>
                    </div>
                  </div>
                </div>
                {formData.address === 'Stop Desk' && (
                  <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border">
                    {t('stopDeskLabel')}
                  </p>
                )}
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
                    {t('loading')}
                  </span>
                ) : (
                  t('confirmOrder')
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              {t('paymentMethod')}
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-card h-fit">
            <h2 className="text-xl font-bold mb-6">{t('orderSummary')}</h2>

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
                      {item.selectedColor} • {item.selectedSize} • {t('quantity')}: {item.quantity}
                    </p>
                    <p className="text-primary font-semibold mt-1">
                      {item.product.price * item.quantity} {t('currency')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span>{total} {t('currency')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('delivery')}</span>
                <span className="text-green-600 font-medium">{t('free')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>{t('total')}</span>
                <span className="text-primary">{total} {t('currency')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
