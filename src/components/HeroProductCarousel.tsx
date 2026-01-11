import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import MicroProductCard from './MicroProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import AutoScroll from 'embla-carousel-auto-scroll';

interface HeroProductCarouselProps {
    products: Product[];
}

const HeroProductCarousel = ({ products }: HeroProductCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        direction: 'rtl',
        slidesToScroll: 'auto',
        containScroll: false, // Must be false for infinite scroll
        loop: true,
        dragFree: true,
        skipSnaps: false, // Better performance for auto scroll
        dragThreshold: 3,
        inViewThreshold: 0.7, // Only render what's needed
    }, [
        AutoScroll({
            playOnInit: true,
            speed: 1,
            stopOnInteraction: false,
            stopOnMouseEnter: true
        })
    ]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    if (!products || products.length === 0) return null;

    return (
        <div className="relative group/carousel w-full mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-forwards" style={{ animationFillMode: 'forwards' }}>
            <div className="overflow-visible px-1" ref={emblaRef}>
                <div className="flex gap-2 py-2 rtl:pr-1 rtl:pl-4 touch-pan-y">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex-[0_0_100px] xs:flex-[0_0_110px] sm:flex-[0_0_130px] min-w-0"
                        >
                            <div className="transform transition-transform duration-300 hover:scale-105">
                                <MicroProductCard product={product} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute -top-12 left-0 flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-gold/50 rounded-full h-8 w-8 backdrop-blur-md"
                    onClick={scrollPrev}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-gold/50 rounded-full h-8 w-8 backdrop-blur-md"
                    onClick={scrollNext}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            <div className="absolute -top-10 right-0 text-white/90 text-sm font-bold px-2 block drop-shadow-md">
                وصل حديثاً ✨
            </div>
        </div>
    );

};

export default HeroProductCarousel;
