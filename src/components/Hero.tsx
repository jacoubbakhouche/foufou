import { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_HERO_IMAGES = [
  "/slider/1.jpg",
  "/slider/2.jpg",
  "/slider/3.jpg"
];

const Hero = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [settings, setSettings] = useState<{
    [key: string]: any,
    images: string[] | null
  } | null>(null);
  const [heroImages, setHeroImages] = useState(DEFAULT_HERO_IMAGES);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_settings')
          .select('*')
          .single();

        if (data) {
          setSettings(data);
          if (data.images && data.images.length > 0) {
            setHeroImages(data.images);
          }
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages]);

  const getText = (key: string, defaultKey: string) => {
    if (!settings) return t(defaultKey);
    const langKey = language === 'ar' ? `${key}_ar` : `${key}_fr`;
    return settings[langKey] || t(defaultKey);
  };

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-black text-white">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((img, index) => (
          <div
            key={img}
            className={cn(
              "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out",
              index === currentImageIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
            )}
            style={{
              backgroundImage: `url('${img}')`,
              transform: index === currentImageIndex ? 'scale(1.05)' : 'scale(1)',
              transition: 'opacity 1s ease-in-out, transform 6s ease-out'
            }}
          />
        ))}
        {/* Cinematic Overlay - Gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
      </div>

      {/* Content Container - z-20 to sit above images/overlay */}
      <div className="relative z-20 container mx-auto px-4 h-full min-h-[90vh] flex flex-col justify-center items-start pt-20">

        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gold/20 backdrop-blur-md border border-gold/30 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
          <span className="flex h-2.5 w-2.5 rounded-full bg-gold animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.5)]"></span>
          <span className="text-gold font-bold uppercase tracking-wider text-sm">
            {getText('promo_text', 'heroPromo')}
          </span>
        </div>

        {/* Main Title Group */}
        <h1 className="max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-forwards delay-200">
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-2 tracking-tight">
            {getText('title_line1', 'discover')}
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gold via-yellow-200 to-gold drop-shadow-sm leading-none pb-4">
            {getText('title_line2', 'trueElegance')}
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-200 mt-6 mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-forwards delay-300">
          {getText('description', 'heroDescription')}
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-forwards delay-500">
          <Button
            size="lg"
            className="h-12 lg:h-14 px-8 lg:px-12 text-base lg:text-lg rounded-full bg-gold hover:bg-gold-light text-black transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-105 font-bold"
            onClick={() => {
              const element = document.getElementById('products');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {getText('button_text', 'shopNow')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 lg:h-14 px-8 lg:px-12 text-base lg:text-lg rounded-full border-2 border-white/30 text-white hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm bg-transparent font-medium"
            onClick={() => navigate('/catalog')}
          >
            {t('browseCollections', 'تصفح المجموعات')}
          </Button>
        </div>

        {/* Feature Highlights (Bottom) */}
        <div className="absolute bottom-12 left-0 right-0 container mx-auto px-4 hidden lg:flex items-center gap-12 text-white/80 border-t border-white/10 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards delay-700">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/50 transition-colors">
              <span className="text-2xl">🚚</span>
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-gold transition-colors">{t('fastDelivery', 'توصيل سريع')}</p>
              <p className="text-xs text-gray-400">لجميع الولايات</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/50 transition-colors">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-gold transition-colors">{t('latestModels', 'أحدث الموديلات')}</p>
              <p className="text-xs text-gray-400">تجدد أسبوعي</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/50 transition-colors">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-gold transition-colors">{t('highQuality', 'جودة عالية')}</p>
              <p className="text-xs text-gray-400">ضمان الرضا</p>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
    </section>

  );
};

export default Hero;
