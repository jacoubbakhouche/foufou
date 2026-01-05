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
        loop: true,
        dragFree: true,
        skipSnaps: true,
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

            {/* Navigation Buttons */}
            <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm z-10 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex"
                onClick={scrollPrev}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-background/80 backdrop-blur-sm z-10 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex"
                onClick={scrollNext}
            >
                <ChevronRight className="h-6 w-6" />
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
