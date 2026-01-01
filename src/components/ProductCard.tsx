import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
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
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up">
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
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full z-10">
            خصم {discountPercentage}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">{product.price} ر.س</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice} ر.س
            </span>
          )}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">اللون:</span>
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'w-6 h-6 rounded-full transition-all border border-border',
                  selectedColor === color && 'ring-2 ring-primary ring-offset-2 scale-110'
                )}
                style={{ backgroundColor: isHexColor(color) ? color : undefined }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">المقاس:</span>
          <div className="flex gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'px-3 py-1 text-xs rounded-lg transition-all border',
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border hover:border-primary/50'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Product Detail Button */}
        <Button
          variant="gold"
          className="w-full rounded-xl h-11 text-base font-bold shadow-gold group-hover:scale-[1.02] transition-transform"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          شراء الآن
        </Button>
      </div>
    </div>
  );
};


export default ProductCard;
