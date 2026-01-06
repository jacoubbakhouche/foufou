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
    <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-start order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 backdrop-blur-md border border-gold/20 rounded-full text-sm font-medium mb-8 animate-fade-up">
              <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse"></span>
              <span className="text-gold-dark dark:text-gold-light">
                {getText('promo_text', 'heroPromo')}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 animate-fade-up leading-tight" style={{ animationDelay: '0.1s' }}>
              <span className="text-foreground block mb-2">{getText('title_line1', 'discover')}</span>
              <span className="text-gradient-gold drop-shadow-lg block">{getText('title_line2', 'trueElegance')}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
              {getText('description', 'heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up mb-12" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                className="h-14 px-10 text-lg rounded-full bg-gradient-gold hover:opacity-90 text-black transition-all shadow-gold w-full sm:w-auto font-bold"
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
                className="h-14 px-10 text-lg rounded-full border-2 border-gold text-foreground hover:bg-gold/10 w-full sm:w-auto bg-transparent font-bold"
                onClick={() => navigate('/catalog')}
              >
                {t('browseCollections', 'تصفح المجموعات')}
              </Button>
            </div>

            {/* Features / Stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gold/10 text-xl shadow-sm border border-gold/10">
                  🚚
                </div>
                <span className="text-sm font-bold text-muted-foreground">{t('fastDelivery', 'توصيل سريع')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gold/10 text-xl shadow-sm border border-gold/10">
                  ✨
                </div>
                <span className="text-sm font-bold text-muted-foreground">{t('latestModels', 'أحدث الموديلات')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gold/10 text-xl shadow-sm border border-gold/10">
                  💎
                </div>
                <span className="text-sm font-bold text-muted-foreground">{t('highQuality', 'جودة عالية')}</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up block order-1 lg:order-2" style={{ animationDelay: '0.3s' }}>
            {/* Main Image Frame - Keeping the thick styled border but with Gold/Dark theme */}
            <div className="relative z-10 rounded-[3rem] overflow-hidden border-[12px] border-background shadow-2xl bg-black">
              <div className="aspect-[4/5] relative">
                {heroImages.map((img, index) => (
                  <img
                    key={img}
                    src={img}
                    alt={`Fashion ${index + 1} `}
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    )}
                  />
                ))}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Internal Floating Badge */}
              <div className="absolute bottom-8 left-8 right-8 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-gold/20 flex items-center justify-between">
                <div>
                  <p className="text-gold text-xs font-bold uppercase tracking-wider mb-1">
                    {t('specialOffer', 'عروض خاصة')}
                  </p>
                  <p className="text-white font-medium text-sm">
                    {t('newSeasonArrivals', 'تشكيلة الموسم الجديد')}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center text-black">
                  <ArrowDown className="h-5 w-5 -rotate-90" />
                </div>
              </div>
            </div>

            {/* Background Decorative Blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold rounded-full blur-[100px] opacity-20 -z-10 animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 -z-10 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
};

export default Hero;
