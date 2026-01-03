import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="about" className="bg-charcoal text-cream py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/favicon_laya.jpg" alt="laya style.23 Logo" className="h-10 w-10 rounded-full border border-primary/20" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                laya style.23
              </span>
            </div>
            <p className="text-cream/70 text-sm leading-relaxed">
              وجهتك الأولى للطباعة المخصصة والاحترافية. نحول أفكارك إلى واقع على الأقمشة، الأغلفة، والهدايا بجودة استثنائية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-cream/70 text-sm">
              <li>
                <a href="#products" className="hover:text-gold transition-colors">المنتجات</a>
              </li>
              <li>
                <a href="#categories" className="hover:text-gold transition-colors">التصنيفات</a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">سياسة الإرجاع</a>
              </li>
              <li>
                <a href="/auth" className="hover:text-gold transition-colors">تسجيل دخول المسؤول</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-cream/70 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <span dir="ltr">0667486731</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <span>contact@layastyle23.dz</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <span>الجزائر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-8 pt-8 text-center text-cream/50 text-sm">
          <p>© 2026 laya style.23. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
