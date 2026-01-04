import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer id="about" className="bg-charcoal text-cream py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                foufou torino
              </span>
            </div>
            <p className="text-cream/70 text-sm leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('menu')}</h4>
            <ul className="space-y-2 text-cream/70 text-sm">
              <li>
                <a href="#products" className="hover:text-gold transition-colors">{t('products')}</a>
              </li>
              <li>
                <a href="#categories" className="hover:text-gold transition-colors">{t('categories')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">{t('profile')}</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('phone')}</h4>
            <ul className="space-y-3 text-cream/70 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <span dir="ltr">0658177627</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <span>contact@foufoutorino.dz</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <span>{t('wilaya')}</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="bg-cream/10 p-2 rounded-full hover:bg-gold hover:text-charcoal transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="bg-cream/10 p-2 rounded-full hover:bg-gold hover:text-charcoal transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-8 pt-8 text-center text-cream/50 text-sm">
          <p>&copy; {new Date().getFullYear()} foufou torino. {t('rightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
