import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowBigRight, Save, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSettings {
    id: string;
    promo_text_fr: string;
    promo_text_ar: string;
    title_line1_fr: string;
    title_line1_ar: string;
    title_line2_fr: string;
    title_line2_ar: string;
    description_fr: string;
    description_ar: string;
    button_text_fr: string;
    button_text_ar: string;
    images: string[];
}

const StoreOrganization = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<HeroSettings | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('hero_settings')
                .select('*')
                .single();

            if (error) {
                // If it's just missing data, we can ignore (might be fresh install)
                if (error.code !== 'PGRST116') {
                    console.error('Error fetching settings:', error);
                    toast.error("Erreur lors du chargement des paramètres");
                }
            }

            if (data) {
                setSettings(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('hero_settings')
                .upsert({
                    id: settings.id,
                    promo_text_fr: settings.promo_text_fr,
                    promo_text_ar: settings.promo_text_ar,
                    title_line1_fr: settings.title_line1_fr,
                    title_line1_ar: settings.title_line1_ar,
                    title_line2_fr: settings.title_line2_fr,
                    title_line2_ar: settings.title_line2_ar,
                    description_fr: settings.description_fr,
                    description_ar: settings.description_ar,
                    button_text_fr: settings.button_text_fr,
                    button_text_ar: settings.button_text_ar,
                    images: settings.images,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success("Paramètres enregistrés avec succès");
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!settings) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('hero-slider')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                toast.error("Erreur lors du téléchargement de l'image");
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('hero-slider')
                .getPublicUrl(filePath);

            const newImages = [...(settings.images || []), publicUrl];
            setSettings({
                ...settings,
                images: newImages
            });

            // Auto-save after upload
            const { error: updateError } = await supabase
                .from('hero_settings')
                .update({ images: newImages, updated_at: new Date().toISOString() })
                .eq('id', settings.id);

            if (updateError) {
                console.error("Update error:", updateError);
                toast.error("Image téléchargée mais erreur lors de la sauvegarde");
            } else {
                toast.success("Image ajoutée avec succès");
            }

        } catch (error) {
            console.error("Error:", error);
            toast.error("Une erreur inattendue est survenue");
        } finally {
            setUploading(false);
            // Reset input value
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        if (!settings) return;
        const newImages = [...(settings.images || [])];
        newImages.splice(index, 1);
        setSettings({
            ...settings,
            images: newImages
        });
    };

    if (!settings && !loading) {
        // Ideally should show a loading state or "Create" state, 
        // but for now let's just initialize an empty state or wait for fetch
        // if completely empty table, we might need a "Create Default" button,
        // but our migration handles default data. 
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                        Organisation du Magasin
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gérez le contenu de la page d'accueil (Hero Section)
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate('/admin')}>
                        Retour
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder
                    </Button>
                </div>
            </div>

            {settings ? (
                <Tabs defaultValue="fr" className="space-y-6">
                    <TabsList className="bg-card w-full h-auto grid grid-cols-1 sm:grid-cols-3 p-1 gap-2">
                        <TabsTrigger value="fr" className="w-full">Français (FR)</TabsTrigger>
                        <TabsTrigger value="ar" className="w-full">العربية (AR)</TabsTrigger>
                        <TabsTrigger value="images" className="w-full">Images Slider</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fr" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contenu Français</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Promo Badge</label>
                                    <Input
                                        value={settings.promo_text_fr}
                                        onChange={(e) => setSettings({ ...settings, promo_text_fr: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Titre Ligne 1</label>
                                        <Input
                                            value={settings.title_line1_fr}
                                            onChange={(e) => setSettings({ ...settings, title_line1_fr: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Titre Ligne 2 (Doré)</label>
                                        <Input
                                            value={settings.title_line2_fr}
                                            onChange={(e) => setSettings({ ...settings, title_line2_fr: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        value={settings.description_fr}
                                        onChange={(e) => setSettings({ ...settings, description_fr: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Texte Bouton</label>
                                    <Input
                                        value={settings.button_text_fr}
                                        onChange={(e) => setSettings({ ...settings, button_text_fr: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ar" className="space-y-4" dir="rtl">
                        <Card>
                            <CardHeader>
                                <CardTitle>المحتوى العربي</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">شارة العرض</label>
                                    <Input
                                        value={settings.promo_text_ar}
                                        onChange={(e) => setSettings({ ...settings, promo_text_ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">العنوان السطر 1</label>
                                        <Input
                                            value={settings.title_line1_ar}
                                            onChange={(e) => setSettings({ ...settings, title_line1_ar: e.target.value })}
                                            dir="rtl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">العنوان السطر 2 (الذهبي)</label>
                                        <Input
                                            value={settings.title_line2_ar}
                                            onChange={(e) => setSettings({ ...settings, title_line2_ar: e.target.value })}
                                            dir="rtl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">الوصف</label>
                                    <Textarea
                                        value={settings.description_ar}
                                        onChange={(e) => setSettings({ ...settings, description_ar: e.target.value })}
                                        rows={4}
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">نص الزر</label>
                                    <Input
                                        value={settings.button_text_ar}
                                        onChange={(e) => setSettings({ ...settings, button_text_ar: e.target.value })}
                                        dir="rtl"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Images du Slider</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label
                                            htmlFor="hero-image-upload"
                                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-md cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="text-center space-y-2">
                                                <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground block">
                                                    Cliquez pour ajouter une image
                                                </span>
                                            </div>
                                            <Input
                                                id="hero-image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {uploading && (
                                    <div className="text-sm text-muted-foreground text-center animate-pulse">
                                        Téléchargement en cours...
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {settings.images?.map((img, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden border aspect-[4/5]">
                                            <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
};

export default StoreOrganization;
