import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    User, Phone, MapPin, Package, Star,
    LogOut, Save, Loader2, Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { ALGERIA_DATA, getWilayas, getCommunesByWilaya, Wilaya, Commune } from '@/constants/algeria-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Profile {
    id: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    wilaya: string | null;
    commune: string | null;
    points: number;
}

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    items: any[];
}

const Profile = () => {
    const navigate = useNavigate();
    const { user, signOut, loading: authLoading } = useAuth();
    const { t, language } = useLanguage();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        wilaya: '',
        commune: ''
    });

    const wilayas = getWilayas();
    const [selectedWilayaCode, setSelectedWilayaCode] = useState<number | null>(null);
    const [communes, setCommunes] = useState<Commune[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
            return;
        }

        if (user) {
            fetchProfileAndOrders();
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (formData.wilaya) {
            const wilaya = wilayas.find(w => w.name === formData.wilaya || w.ar_name === formData.wilaya);
            if (wilaya) {
                setSelectedWilayaCode(wilaya.code);
                setCommunes(getCommunesByWilaya(wilaya.code));
            }
        }
    }, [formData.wilaya]);

    const fetchProfileAndOrders = async () => {
        try {
            if (!user) return;

            // 1. Fetch Profile
            let { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code === 'PGRST116') {
                console.warn('Profile not found, using default');
                profileData = { id: user.id, points: 0, full_name: '', phone: '', address: '', wilaya: '', commune: '' };
            }

            if (profileData) {
                setProfile(profileData);
                setFormData({
                    full_name: profileData.full_name || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                    wilaya: profileData.wilaya || '',
                    commune: profileData.commune || ''
                });
            }

            // 2. Fetch Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
            } else {
                setOrders(ordersData || []);
            }

        } catch (error) {
            console.error('Error in fetchProfileAndOrders:', error);
            toast.error(t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    wilaya: formData.wilaya,
                    commune: formData.commune,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toast.success(t('success'));
            fetchProfileAndOrders(); // Refresh data
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(t('error'));
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            pending: { label: t('status.pending'), variant: 'secondary' },
            confirmed: { label: t('status.confirmed'), variant: 'default' },
            shipping: { label: t('status.shipping'), variant: 'outline' },
            delivered: { label: t('status.delivered'), variant: 'default' },
            cancelled: { label: t('status.cancelled'), variant: 'destructive' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-hero pb-20">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-foreground">{t('myProfile')}</h1>
                    <Button variant="ghost" className="text-destructive hover:text-destructive/80" onClick={signOut}>
                        <LogOut className="h-5 w-5 ml-2" />
                        {t('logout')}
                    </Button>
                </div>

                {/* Loyalty Points Card */}
                <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <CardContent className="flex items-center justify-between p-6 relative z-10">
                        <div>
                            <h2 className="text-lg font-medium text-foreground/80 mb-1">{t('loyaltyPoints')}</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-primary">{profile?.points || 0}</span>
                                <span className="text-sm text-muted-foreground">{t('points')}</span>
                            </div>
                        </div>
                        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <Star className="h-6 w-6 text-primary fill-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="info">{t('personalInfo')}</TabsTrigger>
                        <TabsTrigger value="orders">{t('myOrders')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('editInfo')}</CardTitle>
                                <CardDescription>{t('fillAllFields')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {t('fullName')}
                                    </label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder={t('fullName')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {t('phone')}
                                    </label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder={t('phone')}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('wilaya')}</label>
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
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('wilaya')} />
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('commune')}</label>
                                        <Select
                                            value={formData.commune}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, commune: value }))}
                                            disabled={!selectedWilayaCode}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('commune')} />
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        {t('address')}
                                    </label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder={t('address')}
                                        className="min-h-[80px]"
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button onClick={handleUpdateProfile} disabled={isSaving} className="w-full sm:w-auto">
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('loading')}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {t('saveChanges')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('myOrders')}</CardTitle>
                                <CardDescription>{t('orderSummary')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>{t('noOrders')}</p>
                                        <Button variant="link" onClick={() => navigate('/')} className="mt-2">
                                            {t('products')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-4 bg-card/50 hover:bg-card transition-colors">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-lg">#{order.id.slice(0, 8)}</span>
                                                            {getStatusBadge(order.status)}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-primary text-lg">{order.total} {t('currency')}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-secondary/30 rounded-md p-3 space-y-2">
                                                    {order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{item.product?.name || item.name}</span>
                                                                <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Profile;
