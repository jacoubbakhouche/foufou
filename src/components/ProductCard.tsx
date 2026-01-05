import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  // Safe initialization for colors and sizes
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fallback if images array is empty but single image exists
  const images = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isHexColor = (color: string) => {
    return color.startsWith('#') || /^#[0-9A-F]{6}$/i.test(color);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity <= 0) {
      toast.error(t('outOfStockMessage'));
      return;
    }

    addToCart(product, selectedColor, selectedSize);
    toast.success(t('addedToCart'));
  };

  return (
    <div
      className={cn(
        "group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-gold/20 flex flex-col h-full",
        compact ? "w-full" : ""
      )}
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-cream-dark flex-shrink-0">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={product.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <span className="bg-primary text-primary-foreground text-[10px] font-extrabold px-3 py-1 rounded-full shadow-gold animate-pulse border border-gold/50 tracking-wider">
              {t('new')}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-scale-in">
              -{discountPercentage}%
            </span>
          )}
          {product.stock_quantity <= 0 ? (
            <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-scale-in">
              {t('outOfStock')}
            </span>
          ) : (
            <span className="bg-white/95 backdrop-blur text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-md animate-scale-in flex items-center gap-1 border border-black/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-black">{product.stock_quantity} {t('pieces')}</span>
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-0 right-0 px-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="flex-1 bg-white/90 hover:bg-white text-black backdrop-blur-sm"
          >
            <ShoppingBag className="w-4 h-4 me-2" />
            {t('addToCart')}
          </Button>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link to={`/product/${product.id}`} className="block">
              <h3 className="font-bold text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-1">{product.category}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-lg text-primary whitespace-nowrap">
              {product.price} {t('currency')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through decoration-destructive/50 whitespace-nowrap">
                {product.originalPrice} {t('currency')}
              </span>
            )}
          </div>
        </div>

        {/* Color/Size Preview (Optional) */}
        {!compact && (
          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
            <div className="flex items-center gap-2">
              {product.colors && product.colors.length > 0 && (
                <div className="flex -space-x-1 space-x-reverse">
                  {product.colors.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-border shadow-sm"
                      style={{ backgroundColor: isHexColor(color) ? color : 'gray' }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[8px]">
                      +{product.colors.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              {product.sizes && product.sizes.join(', ')}
            </div>
          </div>
        )}

        {/* Product Detail Button */}
        <Button
          variant="gold"
          className={cn(
            "w-full rounded-xl font-bold shadow-gold group-hover:shadow-gold-lg transition-all flex items-center justify-center gap-2 text-white mt-4",
            compact ? "h-9 text-xs" : "h-10 text-sm sm:text-xs md:text-sm"
          )}
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <ShoppingBag className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>{t('buyNow')}</span>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
