import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gold/20 shadow-sm transition-transform hover:rotate-6">
              <img
                src="/logo_master_print.png"
                alt="Master Print Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-gradient-gold">
              Master Print
            </h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              المنتجات
            </a>
            <a href="#categories" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              التصنيفات
            </a>
            <a href="#about" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              من نحن
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {user && isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
                className="text-muted-foreground hover:text-primary"
                title="لوحة التحكم"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
