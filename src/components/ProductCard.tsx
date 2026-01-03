import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

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

  return (
    <div className={cn(
      "group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-500 animate-fade-up border border-transparent hover:border-gold/20",
      compact ? "w-full" : ""
    )}>
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-cream-dark">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={product.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
              currentImageIndex === index ? "opacity-100 scale-100 group-hover:scale-110" : "opacity-0"
            )}
          />
        ))}

        {product.video_url && (
          <video
            src={product.video_url}
            loop
            muted
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-primary shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="h-5 w-5" />
          </div>
        </div>

        {discountPercentage > 0 && (
          <span className={cn(
            "absolute top-3 right-3 bg-destructive text-white font-bold rounded-full z-10 text-center shadow-lg",
            compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
          )}>
            -{discountPercentage}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className={cn(
        "space-y-2",
        compact ? "p-3" : "p-4"
      )}>
        <Link to={`/product/${product.id}`}>
          <h3 className={cn(
            "font-bold text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer",
            compact ? "text-sm" : "text-base"
          )}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-black text-primary",
            compact ? "text-base" : "text-lg"
          )}>{product.price} د.ج</span>
          {product.originalPrice && (
            <span className={cn(
              "text-muted-foreground line-through opacity-50",
              compact ? "text-[10px]" : "text-xs"
            )}>
              {product.originalPrice} د.ج
            </span>
          )}
        </div>

        {/* Colors & Sizes Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
          {/* Colors */}
          <div className="flex gap-1">
            {product.colors.filter((_, i) => !compact || i < 3).map((color) => (
              <button
                key={color}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color);
                }}
                className={cn(
                  'rounded-full transition-all border border-white shadow-sm',
                  compact ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5',
                  selectedColor === color && 'ring-1 ring-primary ring-offset-1 scale-110'
                )}
                style={{ backgroundColor: isHexColor(color) ? color : undefined }}
              />
            ))}
          </div>

          <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded uppercase">
            {selectedSize}
          </span>
        </div>

        {/* Product Detail Button */}
        <Button
          variant="gold"
          className={cn(
            "w-full rounded-xl font-bold shadow-gold group-hover:shadow-gold-lg transition-all flex items-center justify-center gap-2 text-white",
            compact ? "h-9 text-xs" : "h-10 text-sm"
          )}
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <ShoppingBag className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>شراء الآن</span>
        </Button>
      </div>
    </div>
  );
};


export default ProductCard;
