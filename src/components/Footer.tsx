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
                foufou torino
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
                <span>contact@foufoutorino.dz</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{t('wilaya')}</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-white dark:hover:text-black transition-all duration-300 text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-white dark:hover:text-black transition-all duration-300 text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} foufou torino. {t('rightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
