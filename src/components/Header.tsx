import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from "next-themes";
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import CartSidebar from '@/components/CartSidebar';
import { Settings, Moon, Sun, LogIn, User, Laptop, LogOut, CreditCard, Languages, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-20 md:h-24">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20" onClick={() => navigate('/')}>
            <img
              src="/laya_logo_full.png"
              alt="laya style.23"
              className="h-28 md:h-32 w-auto object-contain"
            />
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <span onClick={() => navigate('/catalog')} className="text-foreground/80 hover:text-primary transition-colors font-medium cursor-pointer">
              {t('products')}
            </span>
            <span onClick={() => navigate('/catalog')} className="text-foreground/80 hover:text-primary transition-colors font-medium cursor-pointer">
              {t('categories')}
            </span>
            <span onClick={() => navigate('/new-arrivals')} className="text-foreground/80 hover:text-primary transition-colors font-medium cursor-pointer relative group">
              {t('newArrivalsPage')}
              <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">New</span>
            </span>
            <span onClick={() => navigate('/sales')} className="text-foreground/80 hover:text-primary transition-colors font-medium cursor-pointer relative group">
              {t('salesPage')}
              <span className="absolute -top-3 -right-3 bg-destructive text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">%</span>
            </span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 absolute right-4 top-1/2 -translate-y-1/2 md:static md:translate-y-0">
            {/* Cart is always visible for easy access */}
            <CartSidebar />

            {/* Consolidated Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[2rem] border-2 border-primary/20 bg-background/95 backdrop-blur-md shadow-xl p-3">
                <DropdownMenuLabel className="text-center text-lg font-bold text-primary flex items-center justify-center gap-2 py-2">
                  <span>✨</span> {t('menu')} <span>✨</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/10" />

                <div className="grid gap-1 p-1">
                  <DropdownMenuItem onClick={() => navigate('/catalog')} className="rounded-xl focus:bg-pink-50 focus:text-pink-600 dark:focus:bg-pink-900/20 cursor-pointer h-12">
                    <span className="text-xl mr-3">🛍️</span>
                    <span className="font-bold">{t('products')}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/catalog')} className="rounded-xl focus:bg-purple-50 focus:text-purple-600 dark:focus:bg-purple-900/20 cursor-pointer h-12">
                    <span className="text-xl mr-3">🍱</span>
                    <span className="font-bold">{t('categories')}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/new-arrivals')} className="rounded-xl focus:bg-blue-50 focus:text-blue-600 dark:focus:bg-blue-900/20 cursor-pointer h-12">
                    <span className="text-xl mr-3">🆕</span>
                    <span className="font-bold text-blue-500">{t('newArrivalsPage')}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/sales')} className="rounded-xl focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20 cursor-pointer h-12">
                    <span className="text-xl mr-3">🏷️</span>
                    <span className="font-bold text-destructive">{t('salesPage')}</span>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-primary/10 my-2" />

                <DropdownMenuLabel className="text-xs text-muted-foreground text-center mb-1">⚙️ {t('settings')}</DropdownMenuLabel>

                {/* Language Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-xl h-10">
                    <span className="text-lg mr-2">🌍</span>
                    <span>Language / اللغة</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-2xl border-primary/20">
                    <DropdownMenuItem onClick={() => setLanguage('fr')} className={language === 'fr' ? 'bg-pink-50 text-pink-600 font-bold rounded-xl' : 'rounded-xl'}>
                      <span>🇫🇷 Français</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('ar')} className={language === 'ar' ? 'bg-pink-50 text-pink-600 font-bold rounded-xl' : 'rounded-xl'}>
                      <span className="font-arabic">🇩🇿 العربية</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Theme Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-xl h-10">
                    <span className="text-lg mr-2">🎨</span>
                    <span>{t('theme')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-2xl border-primary/20">
                    <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl">
                      <Sun className="mr-2 h-4 w-4 text-orange-400" />
                      {t('light')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl">
                      <Moon className="mr-2 h-4 w-4 text-indigo-400" />
                      {t('dark')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl">
                      <Laptop className="mr-2 h-4 w-4 text-gray-400" />
                      {t('system')}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-primary/10 my-2" />

                {/* Auth Actions */}
                {user ? (
                  isAdmin ? (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-xl h-12 focus:bg-amber-50 focus:text-amber-600 font-bold">
                      <span className="text-xl mr-2">👑</span>
                      {t('dashboard')}
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl h-12 focus:bg-pink-50 focus:text-pink-600 font-bold">
                        <span className="text-xl mr-2">🎀</span>
                        {t('profile')}
                      </DropdownMenuItem>
                    </>
                  )
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/auth')} className="rounded-xl h-12 focus:bg-green-50 focus:text-green-600 font-bold">
                    <span className="text-xl mr-2">🔐</span>
                    {t('login')}
                  </DropdownMenuItem>
                )}

                {user && (
                  <>
                    <DropdownMenuSeparator className="bg-primary/10" />
                    <DropdownMenuItem
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                      }}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl h-12 mt-1"
                    >
                      <span className="text-xl mr-2">👋</span>
                      {t('logout')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
