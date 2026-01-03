import { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HERO_IMAGES = [
  "/slider/1.jpg",
  "/slider/2.jpg",
  "/slider/3.jpg"
];

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right">
            <span className="inline-block px-4 py-2 bg-gold/10 text-gold-dark dark:text-gold-light rounded-full text-sm font-semibold mb-6 animate-fade-up">
              🎉 نقوم بوضع خصومات في بعض الاحيان تابعونا ليصلكم كل جديد
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-foreground">اكتشفي</span>
              <br />
              <span className="text-gradient-gold">أناقتك الحقيقية</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              مجموعة مميزة من أرقى الأزياء النسائية العصرية. تصاميم فريدة بجودة عالية تناسب ذوقك الرفيع وتبرز جمالك.
              <br />
              <strong className="text-foreground">الدفع عند الاستلام</strong> - توصيل لجميع الولايات
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="hero" size="xl" asChild>
                <a href="#products">
                  تسوقي الآن
                </a>
              </Button>
              <Button variant="outline" size="xl" asChild className="bg-background/50 backdrop-blur-sm">
                <a href="#categories">
                  تصفح المجموعات
                </a>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚚</span>
                <span className="text-sm">توصيل سريع</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👗</span>
                <span className="text-sm">أحدث الموديلات</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💎</span>
                <span className="text-sm">جودة عالية</span>
              </div>
            </div>
          </div>

          {/* Welcome Image Carousel */}
          <div className="relative block h-[400px] lg:h-[600px] animate-fade-up order-first lg:order-last mb-8 lg:mb-0" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gold/20 rounded-[3rem] rotate-3 scale-105 blur-sm -z-10" />

            <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20">
              {HERO_IMAGES.map((img, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  )}
                >
                  <img
                    src={img}
                    alt={`Fashion style ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for better text contrast if needed in future */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ))}
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-10 -left-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">✨</div>
              <div>
                <p className="text-xs text-muted-foreground">خيارات متنوعة</p>
                <p className="text-sm font-bold">لإطلالة عصرية</p>
              </div>
            </div>
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
