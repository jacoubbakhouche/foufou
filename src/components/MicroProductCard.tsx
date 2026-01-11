import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MicroProductCardProps {
    product: Product;
}

const MicroProductCard = ({ product }: MicroProductCardProps) => {
    const { t } = useLanguage();
    const image = product.images?.[0] || product.image || '';

    return (
        <Link
            to={`/product/${product.id}`}
            className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border h-full w-full"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted transform-gpu backface-hidden">
                <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Minimal Overlay */}
                <div className="absolute inset-0 bg-black/5 dark:bg-black/20 group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-colors" />

                {/* Quick Add Button */}
                <div className="absolute bottom-2 right-2 left-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-background/90 backdrop-blur-md text-foreground text-xs font-bold py-1.5 px-2 rounded-lg text-center shadow-sm border border-border">
                        {t('viewDetails', 'مشاهدة')}
                    </div>
                </div>
            </div>

            <div className="p-2">
                <h3 className="font-bold text-xs text-card-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-primary whitespace-nowrap">
                        {product.price} {t('currency')}
                    </span>
                    {product.originalPrice && (
                        <span className="text-[10px] text-muted-foreground line-through decoration-destructive/50">
                            {product.originalPrice}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default MicroProductCard;
