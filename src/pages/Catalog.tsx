import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CatalogProps {
    mode?: 'default' | 'new' | 'sale';
}

const Catalog = ({ mode = 'default' }: CatalogProps) => {
    const { t } = useLanguage();
    const { products, loading } = useProducts();
    const allCategories = useCategories(products);

    // Dynamic Title & Description
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

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter and Sort Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Mode Pre-filtering
        if (mode === 'new') {
            result = result.filter(p => p.isNew);
        } else if (mode === 'sale') {
            result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
        }

        // Filter by Category
        if (selectedCategory && selectedCategory !== 'الكل') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                break;
        }

        return result;
    }, [products, selectedCategory, searchQuery, sortBy, mode]);

    const categories = ['الكل', ...allCategories.filter(c => c !== 'الكل')];

    // Common Filter Content
    const FilterContent = () => (
        <div className="space-y-6">
            <div>
                <h3 className="font-bold mb-4 text-lg">{t('categories', 'التصنيفات')}</h3>
                <div className="flex flex-col space-y-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category === 'الكل' ? null : category);
                                if (window.innerWidth < 1024) setIsFilterOpen(false);
                            }}
                            className={cn(
                                "text-start px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                                (selectedCategory === category || (category === 'الكل' && !selectedCategory))
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-center md:text-start">
                        {title}
                    </h1>
                    <p className="text-muted-foreground text-center md:text-start max-w-2xl">
                        {description}
                    </p>
                </div>

                {/* Toolbar (Search & Mobile Filter) */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 md:top-24 z-30 bg-background/95 backdrop-blur py-4 border-b">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder={t('searchPlaceholder', 'ابحث عن منتج...')}
                            className="pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* Sort Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 shrink-0">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('sortBy', 'ترتيب حسب')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                                    {t('newest', 'وصل حديثاً')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('price-asc')}>
                                    {t('priceLowHigh', 'السعر: من الأقل للأعلى')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('price-desc')}>
                                    {t('priceHighLow', 'السعر: من الأعلى للأقل')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Filter Trigger */}
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden gap-2 shrink-0">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span>{t('filter', 'تصفية')}</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>{t('filters', 'خيارات التصفية')}</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterContent />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 shrink-0 sticky top-48 h-fit">
                        <FilterContent />
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-secondary animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} compact />
                                ))}
                            </div>
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
