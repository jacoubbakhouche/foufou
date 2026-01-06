import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

interface ProductCarouselProps {
    products: Product[];
}

const ProductCarousel = ({ products }: ProductCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        direction: 'rtl',
        slidesToScroll: 'auto',
        containScroll: 'trimSnaps',
        loop: false, // User requested to stop looping
        dragFree: true,
        skipSnaps: true,
        dragThreshold: 3,
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <div className="relative group/carousel -mx-4 md:mx-0">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3 md:gap-6 py-8 px-0 md:px-4 rtl:pr-0 rtl:md:pr-4 rtl:pl-4 rtl:md:pl-0">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex-[0_0_160px] xs:flex-[0_0_180px] sm:flex-[0_0_210px] md:flex-[0_0_240px] min-w-0 pl-1"
                        >
                            <ProductCard product={product} compact={true} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons - Visible on Mobile now */}
            <Button
                variant="outline"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 shadow-md backdrop-blur-sm z-10 rounded-full h-8 w-8 md:h-10 md:w-10 opacity-70 hover:opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-all"
                onClick={scrollPrev}
            >
                <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 shadow-md backdrop-blur-sm z-10 rounded-full h-8 w-8 md:h-10 md:w-10 opacity-70 hover:opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-all"
                onClick={scrollNext}
            >
                <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
            </Button>

            {/* Custom Scroll Indicator for Mobile */}
            <div className="md:hidden flex justify-center gap-2 mt-4 overflow-x-auto no-scrollbar">
                <div className="h-1 bg-secondary rounded-full w-24 relative overflow-hidden">
                    <div className="absolute inset-y-0 right-0 bg-primary/30 w-1/3 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default ProductCarousel;
