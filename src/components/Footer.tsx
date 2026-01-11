import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer id="about" className="bg-background border-t border-border py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                layastyle23
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t('menu')}</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#products" className="hover:text-primary transition-colors">{t('products')}</a>
              </li>
              <li>
                <a href="#categories" className="hover:text-primary transition-colors">{t('categories')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('profile')}</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t('phone')}</h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">0658177627</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@layastyle23.dz</span>
              </li>
              <li className="flex items-center gap-2">
                <a
                  href="https://www.google.com/maps/place/Laya_style.23/@36.9011282,7.7596387,15z/data=!4m6!3m5!1s0x12f0075b0f7c1dfb:0x6a21f9a69a042e57!8m2!3d36.9011282!4d7.7596387!16s%2Fg%2F11zjvp9vv5"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                >
                  <span className="text-lg animate-bounce">📍</span>
                  <span className="group-hover:underline underline-offset-4 decoration-primary">{t('annaba')}</span>
                </a>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href="https://m.facebook.com/profile.php?id=61556110481553&mibextid=wwXIfr&mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-white dark:hover:text-black transition-all duration-300 text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/laya_style.23/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noreferrer"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-white dark:hover:text-black transition-all duration-300 text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@laya.style.23"
                target="_blank"
                rel="noreferrer"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-white dark:hover:text-black transition-all duration-300 text-foreground"
                aria-label="TikTok"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>
            &copy; {new Date().getFullYear()} layastyle23.
            <a
              href="https://www.instagram.com/jacobbakhouche?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="rainbow-border hover:scale-105 inline-block text-foreground font-bold transition-transform ml-1"
            >
              Developed by Jacob Bakhouche
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
