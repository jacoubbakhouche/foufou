import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
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
              🎉 خصم 30% على جميع المنتجات
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-foreground">تميز بمنتجاتك</span>
              <br />
              <span className="text-gradient-gold">المخصصة هنا</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              نقدم خدمات الطباعة المتكاملة على الأقمشة، الأغلفة، والعديد من المنتجات الأخرى لتناسب ذوقك الخاص.
              <br />
              <strong className="text-foreground">الدفع عند الاستلام</strong> - جودة تليق بك
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="hero" size="xl" asChild>
                <a href="#products">
                  تسوق الآن
                </a>
              </Button>
              <Button variant="outline" size="xl" asChild className="bg-background/50 backdrop-blur-sm">
                <a href="#categories">
                  تصفح التصنيفات
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
                <span className="text-2xl">💳</span>
                <span className="text-sm">الدفع عند الاستلام</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                <span className="text-sm">إرجاع مجاني</span>
              </div>
            </div>
          </div>

          {/* Welcome Image */}
          <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gold/20 rounded-3xl rotate-3 scale-105 blur-sm -z-10" />
            <div className="aspect-square rounded-full overflow-hidden shadow-2xl border-8 border-gold/20 dark:border-gold/10 p-4 bg-background animate-scale-in">
              <img
                src="/logo_master_print.png"
                alt="Master Print Logo"
                className="w-full h-full object-contain transition-transform duration-700 hover:rotate-6 hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl flex items-center gap-3 border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">✨</div>
              <div>
                <p className="text-xs text-muted-foreground">ثقة العملاء</p>
                <p className="text-sm font-bold">10,000+ عميل راضٍ</p>
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
