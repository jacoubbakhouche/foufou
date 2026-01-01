import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      "group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up",
      compact ? "border border-border/50" : ""
    )}>
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-cream-dark">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={product.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
              currentImageIndex === index ? "opacity-100 scale-105" : "opacity-0"
            )}
          />
        ))}
        {discountPercentage > 0 && (
          <span className={cn(
            "absolute top-3 right-3 bg-destructive text-destructive-foreground font-bold rounded-full z-10 text-center",
            compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
          )}>
            خصم {discountPercentage}%
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
            "font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer",
            compact ? "text-sm" : "text-lg"
          )}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold text-gradient-gold",
            compact ? "text-base" : "text-xl"
          )}>{product.price} د.ج</span>
          {product.originalPrice && (
            <span className={cn(
              "text-muted-foreground line-through opacity-60",
              compact ? "text-[10px]" : "text-sm"
            )}>
              {product.originalPrice} د.ج
            </span>
          )}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">اللون:</span>
          <div className="flex gap-1">
            {product.colors.filter((_, i) => !compact || i < 4).map((color) => (
              <button
                key={color}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color);
                }}
                className={cn(
                  'rounded-full transition-all border border-border',
                  compact ? 'w-4 h-4' : 'w-6 h-6',
                  selectedColor === color && 'ring-1 ring-primary ring-offset-1 scale-110'
                )}
                style={{ backgroundColor: isHexColor(color) ? color : undefined }}
                title={color}
              />
            ))}
            {compact && product.colors.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{product.colors.length - 4}</span>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground">المقاس:</span>
          <div className="flex gap-1">
            {product.sizes.filter((_, i) => !compact || i < 3).map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(size);
                }}
                className={cn(
                  'rounded-md transition-all border font-medium',
                  compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border hover:border-primary/50'
                )}
              >
                {size}
              </button>
            ))}
            {compact && product.sizes.length > 3 && (
              <span className="text-[10px] text-muted-foreground">..</span>
            )}
          </div>
        </div>

        {/* Product Detail Button */}
        <Button
          variant="gold"
          className={cn(
            "w-full rounded-xl font-bold shadow-gold group-hover:scale-[1.02] transition-transform",
            compact ? "h-9 text-xs" : "h-11 text-base"
          )}
          onClick={() => navigate(`/product/${product.id}`)}
        >
          شراء الآن
        </Button>
      </div>
    </div>
  );
};


export default ProductCard;
