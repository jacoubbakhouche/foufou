import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import CartSidebar from '@/components/CartSidebar';
import { Settings, Moon, Sun, LogIn, User, Laptop } from 'lucide-react';
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
  const { user, isAdmin } = useAuth();
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center gap-2">
              <img src="/favicon_laya.jpg" alt="laya style.23 Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-primary/20" />
              <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 tracking-tight">
                laya style.23
              </h1>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              المنتجات
            </a>
            <a href="#categories" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              التصنيفات
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart is always visible for easy access */}
            <CartSidebar />

            {/* Consolidated Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary">
                  <Settings className="h-5 w-5 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>القائمة</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const element = document.getElementById('products');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}>
                  <span className="font-medium">المنتجات</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>الإعدادات</DropdownMenuLabel>

                {/* Theme Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>المظهر</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      الوضع المضيء
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      الوضع الداكن
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Laptop className="mr-2 h-4 w-4" />
                      حسب النظام
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Auth Actions */}
                {user ? (
                  isAdmin ? (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      لوحة التحكم
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem disabled>
                      <User className="mr-2 h-4 w-4" />
                      مسجل كـ {user.email?.split('@')[0]}
                    </DropdownMenuItem>
                  )
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/auth')}>
                    <LogIn className="mr-2 h-4 w-4" />
                    تسجيل الدخول / اشتراك
                  </DropdownMenuItem>
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
