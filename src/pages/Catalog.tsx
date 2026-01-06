import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// ... existing imports

interface CatalogProps {
    mode?: 'default' | 'new' | 'sale';
}

const Catalog = ({ mode = 'default' }: CatalogProps) => {
    const { t } = useLanguage();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // Scroll to top when page changes
    useMemo(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    // Fetch Data Server-Side
    const { products, loading, totalCount } = useProducts({
        page,
        limit: ITEMS_PER_PAGE,
        category: selectedCategory === 'الكل' ? null : selectedCategory,
        search: searchQuery,
        sortBy: sortBy as any,
        isNew: mode === 'new',
        isSale: mode === 'sale',
        keepPreviousData: false // Replace data, don't append
    });

    const categories = useCategories();
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Reset Page on Filter Change
    const handleFilterChange = (updater: any) => {
        updater();
        setPage(1);
    };

    // ... getPageDetails ... same logic
    const getPageDetails = () => {
        switch (mode) {
            case 'new':
                return {
                    title: t('newArrivalsPage', 'وصل حديثاً'),
                    description: t('newArrivalsDescription', 'تصفح أحدث ما وصلنا من منتجات.')
                };
            case 'sale':
                return {
                    title: t('salesPage', 'تخفيضات'),
                    description: t('salesDescription', 'استفد من أفضل العروض والخصومات لدينا.')
                };
            default:
                return {
                    title: t('catalog', 'المتجر'),
                    description: t('catalogDescription', 'تصفح جميع منتجاتنا مع خيارات بحث وتصنيف متقدمة.')
                };
        }
    };
    const { title, description } = getPageDetails();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Page Header and Toolbar same as before ... */}

                {/* Copied from existing file to keep context if needed, but since I am replacing logic, I will restart the return block for clarity in the tool call if I could, but I must match exact lines. */}
                {/* Since the file is huge and I'm changing the middle/end mostly. */}

                <div className="mb-8 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-center md:text-start">
                        {title}
                    </h1>
                    <p className="text-muted-foreground text-center md:text-start max-w-2xl">
                        {description}
                    </p>
                </div>

                {/* Toolbar (Search & Sort & Categories) */}
                <div className="sticky top-20 md:top-24 z-30 bg-background/95 backdrop-blur transition-all pb-2">
                    <div className="flex flex-col md:flex-row gap-4 mb-4 py-4 border-b">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder={t('searchPlaceholder', 'ابحث عن منتج...')}
                                className="pr-10 rounded-full bg-secondary/20 border-border/50 focus:bg-background transition-colors"
                                value={searchQuery}
                                onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
                            />
                        </div>

                        <div className="flex gap-2">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2 shrink-0 rounded-full border-border/50">
                                        <ArrowUpDown className="h-4 w-4" />
                                        <span className="hidden sm:inline">{t('sortBy', 'ترتيب حسب')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleFilterChange(() => setSortBy('newest'))}>
                                        {t('newest', 'وصل حديثاً')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterChange(() => setSortBy('price-asc'))}>
                                        {t('priceLowHigh', 'السعر: من الأقل للأعلى')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterChange(() => setSortBy('price-desc'))}>
                                        {t('priceHighLow', 'السعر: من الأعلى للأقل')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Category Carousel - Now Inside Sticky Header */}
                    <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        <div className="flex gap-3 min-w-max">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleFilterChange(() => setSelectedCategory(category === 'الكل' ? null : category))}
                                    className={cn(
                                        "px-6 py-3 rounded-full transition-all text-sm font-bold whitespace-nowrap shadow-sm border",
                                        (selectedCategory === category || (category === 'الكل' && !selectedCategory))
                                            ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md"
                                            : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground hover:border-primary/50"
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-4">

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading && products.length === 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-secondary animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} compact />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                <div className="mt-12">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>

                                            {[...Array(totalPages)].map((_, i) => {
                                                const p = i + 1;
                                                // Simple logic: show all for now, or truncate if many pages.
                                                // For 1M products we need smart truncation (1, 2, 3 ... 10).
                                                // But for simplicity let's just show current window or max 5 pages.
                                                if (Math.abs(page - p) > 2 && p !== 1 && p !== totalPages) {
                                                    if (Math.abs(page - p) === 3) return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>;
                                                    return null;
                                                }
                                                return (
                                                    <PaginationItem key={p}>
                                                        <PaginationLink
                                                            isActive={page === p}
                                                            onClick={() => setPage(p)}
                                                            className="cursor-pointer"
                                                        >
                                                            {p}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-secondary">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('noResults', 'لا توجد نتائج')}</h3>
                                <p className="text-muted-foreground mb-6">
                                    {t('tryDifferentSearch', 'جرب البحث بكلمات مختلفة أو تغيير التصنيف')}
                                </p>
                                <Button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory(null);
                                        setPage(1);
                                    }}
                                >
                                    {t('clearFilters', 'مسح التصفية')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Catalog;
