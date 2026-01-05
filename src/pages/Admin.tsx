import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  LogOut, Plus, Pencil, Trash2, Package, ShoppingCart,
  RefreshCcw, Home, Phone, MapPin, User, Upload, X, Check, Link as LinkIcon, Search
} from 'lucide-react';
import { toast } from 'sonner';

import StoreOrganization from './admin/StoreOrganization';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  images: string[];
  image?: string;
  category: string;
  colors: string[];
  sizes: string[];
  description: string | null;
  in_stock: boolean;
  stock_quantity: number;
  video_url?: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: any[];
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, checkingRole, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    original_price: '',
    images: [] as string[],
    category: '',
    colors: [] as string[],
    sizes: [] as string[],
    description: '',
    in_stock: true,
    stock_quantity: '0',
    video_url: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [newColor, setNewColor] = useState('#000000');
  const [newSize, setNewSize] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && !checkingRole && user && !isAdmin) { // Wait for checkingRole to complete
      toast.error('غير مصرح لك بالوصول');
      navigate('/');
    }
  }, [user, isAdmin, loading, checkingRole, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();

      // Register for Push Notifications ONLY when in Admin
      // TEMPORARILY DISABLED FOR WEB DEVELOPMENT
      /*
      if (Capacitor.isNativePlatform()) {
        const registerPush = async () => {
          try {
            const { PushNotifications } = await import('@capacitor/push-notifications');

            let permStatus = await PushNotifications.checkPermissions();
            if (permStatus.receive === 'prompt') {
              permStatus = await PushNotifications.requestPermissions();
            }
            if (permStatus.receive === 'granted') {
              await PushNotifications.register();
              PushNotifications.addListener('registration', async (token) => {
                if (user) {
                  try {
                    await supabase.from('fcm_tokens').upsert({
                      user_id: user.id,
                      token: token.value,
                      device_type: Capacitor.getPlatform(),
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id, token' });
                  } catch (err) {
                    console.error("Token save error", err);
                  }
                }
              });
            }
          } catch (err) {
            console.error("Push Notifications plugin not found or failed to load", err);
          }
        };
        registerPush().catch(console.error);
      }
      */
    }
  }, [isAdmin, user]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('خطأ في جلب المنتجات');
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('خطأ في جلب الطلبات');
    } else {
      const formattedOrders = (data || []).map((order) => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : [],
        notes: order.notes || null,
      })) as Order[];
      setOrders(formattedOrders);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      original_price: '',
      images: [],
      category: '',
      colors: [],
      sizes: [],
      description: '',
      in_stock: true,
      stock_quantity: '0',
      video_url: '',
    });
    setEditingProduct(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));

    if (productForm.images.length + imageFiles.length > 7) {
      toast.error('يمكنك رفع 7 صور كحد أقصى للمنتج الواحد');
      return;
    }

    if (videoFiles.length > 1) {
      toast.error('يمكنك رفع فيديو واحد فقط');
      return;
    }

    if (videoFiles.length > 0 && productForm.video_url) {
      // Logic if replacing existing video? just overwrite
      // toast.info('سيتم استبدال الفيديو الحالي'); 
    }

    setIsUploading(true);
    const newImages: string[] = [];
    let uploadedVideoUrl = '';
    let errorCount = 0;

    try {
      // Upload Images
      await Promise.all(imageFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          errorCount++;
          console.error("Image Upload error:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
          newImages.push(publicUrl);
        }
      }));

      // Upload Video
      if (videoFiles.length > 0) {
        const file = videoFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`فشل رفع الفيديو: ${uploadError.message}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
          uploadedVideoUrl = publicUrl;
          toast.success('تم رفع الفيديو بنجاح');
        }
      }

      if (newImages.length > 0) {
        setProductForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        toast.success(`تم رفع ${newImages.length} صور بنجاح`);
      }

      if (uploadedVideoUrl) {
        setProductForm(prev => ({ ...prev, video_url: uploadedVideoUrl }));
      }

      if (errorCount > 0) {
        toast.error(`فشل رفع ${errorCount} صور`);
      }

    } catch (error: any) {
      toast.error('حدث خطأ غير متوقع أثناء الرفع');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const addColor = () => {
    if (newColor && !productForm.colors.includes(newColor)) {
      setProductForm(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
    }
  };

  const removeColor = (color: string) => {
    setProductForm(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  };

  const addSize = () => {
    if (newSize && !productForm.sizes.includes(newSize)) {
      setProductForm(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setProductForm(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        images: product.images || (product.image ? [product.image] : []),
        category: product.category,
        colors: product.colors,
        sizes: product.sizes,
        description: product.description || '',
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity?.toString() || '0',
        video_url: (product as any).video_url || '',
      });
    } else {
      resetProductForm();
    }
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || productForm.images.length === 0 || !productForm.category) {
      toast.error('يرجى ملء جميع الحقول المطلوبة (الاسم، السعر، صورة واحدة على الأقل، التصنيف)');
      return;
    }

    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      image: productForm.images[0] || '', // First image for backward compatibility
      images: productForm.images,
      category: productForm.category,
      colors: productForm.colors,
      sizes: productForm.sizes,
      description: productForm.description || null,
      in_stock: productForm.in_stock,
      stock_quantity: parseInt(productForm.stock_quantity) || 0,
      video_url: productForm.video_url || null,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast.error('خطأ في تحديث المنتج');
      } else {
        toast.success('تم تحديث المنتج بنجاح');
        setIsProductDialogOpen(false);
        resetProductForm();
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        toast.error('خطأ في إضافة المنتج');
      } else {
        toast.success('تم إضافة المنتج بنجاح');
        setIsProductDialogOpen(false);
        resetProductForm();
        fetchProducts();
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('خطأ في حذف المنتج');
    } else {
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, oldStatus: string) => {
    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('خطأ في تحديث حالة الطلب');
      return;
    }

    // DB Trigger now handles stock updates based on status changes (Cancelled <-> Other)

    toast.success('تم تحديث حالة الطلب');

    // Always refresh data
    await fetchOrders();
    await fetchProducts();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' },
      confirmed: { label: 'تم التأكيد', variant: 'default' },
      shipping: { label: 'جاري الشحن', variant: 'outline' },
      delivered: { label: 'تم التسليم', variant: 'default' },
      cancelled: { label: 'ملغي', variant: 'destructive' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gradient-gold">لوحة التحكم</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4" />
                العودة للمتجر
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" dir="rtl">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="store-settings" className="gap-2">
              <Pencil className="h-4 w-4" />
              تنسيق المتجر
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">إدارة الطلبات</h2>
                <Button variant="outline" size="sm" onClick={fetchOrders}>
                  <RefreshCcw className="h-4 w-4" />
                  تحديث
                </Button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-primary" />
                            <span className="font-medium">{order.customer_name}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${order.phone}`} className="hover:text-primary hover:underline" dir="ltr">
                              {order.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{order.address}</span>
                          </div>

                          {/* Delivery Type Badge */}
                          <div className="mt-2">
                            {order.address.includes('Stop Desk') ? (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20">
                                <Package className="w-3 h-3 mr-1" />
                                توصيل للمكتب (Stop Desk)
                              </Badge>
                            ) : order.address.includes('Home Delivery') ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">
                                <Home className="w-3 h-3 mr-1" />
                                توصيل للمنزل
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-bold text-primary">{order.total} د.ج</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm font-medium mb-2">المنتجات:</p>
                        <div className="space-y-3">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm flex items-center gap-3 bg-secondary/20 p-2 rounded-lg border border-border/50">
                              <img
                                src={item.image || item.product?.image || (item.product?.images && item.product.images[0]) || '/placeholder.svg'}
                                className="w-12 h-12 object-cover rounded shadow-sm border border-border/50"
                                alt=""
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground">{item.product?.name || item.name}</span>
                                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">×{item.quantity}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1 border border-border rounded-full px-2 py-0.5 bg-background">
                                    <div
                                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                                      style={{ backgroundColor: item.selectedColor }}
                                    />
                                    <span className="text-[10px] font-mono uppercase opacity-70">{item.selectedColor}</span>
                                  </div>
                                  <span className="bg-background border border-border px-2 py-0.5 rounded-full text-[10px] font-bold">المقاس: {item.selectedSize}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 justify-between">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value, order.status)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="confirmed">تم التأكيد</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
                              try {
                                // DB Trigger handles stock restoration on delete automatically

                                const { error } = await supabase.from('orders').delete().match({ id: order.id });
                                if (error) {
                                  console.error('Delete error:', error);
                                  toast.error('خطأ في حذف الطلب: ' + error.message);
                                } else {
                                  // Always refresh data
                                  await fetchOrders();
                                  await fetchProducts();
                                  toast.success('تم حذف الطلب واسترجاع المخزون (إن وجد)');
                                }
                              } catch (err) {
                                console.error('Delete exception:', err);
                                toast.error('حدث خطأ أثناء الحذف');
                              }
                            }
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">إدارة المنتجات</h2>

                <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث عن منتج..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pr-9"
                    />
                  </div>
                </div>

                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gold" onClick={() => openProductDialog()}>
                      <Plus className="h-4 w-4" />
                      إضافة منتج
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">اسم المنتج *</label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="اسم المنتج"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">السعر *</label>
                          <Input
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            placeholder="299"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">السعر الأصلي</label>
                          <Input
                            type="number"
                            value={productForm.original_price}
                            onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                            placeholder="399"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-3 block text-foreground">
                          صور المنتج (حتى 7 صور) *
                          <span className="text-muted-foreground mr-1">({productForm.images.length}/7)</span>
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                          {productForm.images.map((imgUrl, index) => (
                            <div key={index} className="relative aspect-square border-2 border-border rounded-xl overflow-hidden group">
                              <img src={imgUrl} alt={`Product ${index}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setProductForm(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }))}
                                className="absolute top-1 left-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-0 right-0 left-0 bg-primary/80 text-[10px] text-white text-center py-0.5">
                                  الرئيسية
                                </div>
                              )}
                            </div>
                          ))}

                          {productForm.images.length < 7 && (
                            <label
                              htmlFor="image-upload"
                              className={cn(
                                "flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors",
                                isUploading && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {isUploading ? (
                                <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
                              ) : (
                                <>
                                  <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                                  <span className="text-[10px] text-muted-foreground">أضف</span>
                                </>
                              )}
                            </label>
                          )}
                        </div>


                        <input
                          type="file"
                          accept="image/*,video/mp4,video/webm"
                          multiple
                          className="hidden"
                          id="image-upload"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        <p className="text-xs text-muted-foreground mt-2 italic">أول صورة ستكون الصورة الرئيسية للمنتج</p>
                      </div>

                      {productForm.video_url && (
                        <div className="mb-4">
                          <label className="text-sm font-medium mb-1 block">الفيديو المرفق</label>
                          <div className="relative rounded-xl overflow-hidden aspect-video border border-border bg-black/10 group">
                            <video src={productForm.video_url} controls className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setProductForm(prev => ({ ...prev, video_url: '' }))}
                              className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium mb-1 block">التصنيف *</label>
                        <Input
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          placeholder="قمصان"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">الألوان</label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-12 p-0 h-10"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={addColor}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {productForm.colors.map((color) => (
                            <div
                              key={color}
                              className="flex items-center gap-1 bg-secondary p-1 pr-2 rounded-full border border-border"
                            >
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-mono uppercase">{color}</span>
                              <button
                                onClick={() => removeColor(color)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">المقاسات</label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            placeholder="مثلا: L أو 42"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={addSize}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {productForm.sizes.map((size) => (
                            <div
                              key={size}
                              className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full border border-border"
                            >
                              <span className="text-sm">{size}</span>
                              <button
                                onClick={() => removeSize(size)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">الوصف</label>
                        <Textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="وصف المنتج..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">الكمية المتوفرة *</label>
                        <Input
                          type="number"
                          min="0"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">عدد القطع المتوفرة في المخزون</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="in_stock"
                          checked={productForm.in_stock}
                          onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor="in_stock" className="text-sm">متوفر في المخزون</label>
                      </div>
                      <Button variant="gold" className="w-full" onClick={handleSaveProduct}>
                        {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الصورة</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>التصنيف</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>المخزون</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <span className="font-bold text-primary">{product.price} د.ج</span>
                          {product.original_price && (
                            <span className="text-xs text-muted-foreground line-through mr-2">
                              {product.original_price} د.ج
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold",
                              product.stock_quantity === 0 && "text-destructive",
                              product.stock_quantity > 0 && product.stock_quantity < 10 && "text-destructive",
                              product.stock_quantity >= 10 && "text-green-600"
                            )}>
                              {product.stock_quantity || 0}
                            </span>
                            {product.stock_quantity === 0 && (
                              <Badge variant="destructive" className="text-[10px]">نفذ</Badge>
                            )}
                            {product.stock_quantity > 0 && product.stock_quantity < 10 && (
                              <Badge variant="outline" className="text-[10px] text-destructive border-destructive">قليل</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.in_stock ? 'default' : 'secondary'}>
                            {product.in_stock ? 'متوفر' : 'غير متوفر'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openProductDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const url = `${window.location.origin}/product/${product.id}`;
                                navigator.clipboard.writeText(url);
                                toast.success('تم نسخ رابط المنتج بنجاح');
                              }}
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="store-settings">
            <StoreOrganization />
          </TabsContent>
        </Tabs>
      </main>
    </div >
  );
};

export default Admin;
