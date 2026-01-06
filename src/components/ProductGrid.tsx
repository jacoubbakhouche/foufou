import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';

const ProductGrid = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  // We use key to force re-mounting or reset pagination when category changes?
  // Better: reset page to 1 when category changes.

  const { products, loading, hasMore } = useProducts({
    category: selectedCategory === 'الكل' ? null : selectedCategory,
    page,
    limit: 8 // Limit to 8 items (2 rows of 4)
  });

  // Independent Category Fetch
  const categories = useCategories();

  // Reset page when category changes
  const handleCategoryChange = (cat: string) => {
    if (selectedCategory !== cat) {
      setSelectedCategory(cat);
      setPage(1); // Reset to page 1
    }
  };

  // Removed chunking logic to display a single unified carousel
  // const chunkProducts = ... 
  // const productGroups = ...

  return (
    <section id="products" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-gold">أحدث</span> المنتجات
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            استعرض تشكيلتنا المميزة من المنتجات المخصصة بجودة عالية
          </p>
        </div>

        {/* Categories Filter */}
        <div id="categories" className="flex overflow-x-auto pb-4 gap-3 px-4 no-scrollbar items-center justify-start md:justify-center touch-pan-x snap-x">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 shrink-0 whitespace-nowrap snap-center border-2 shadow-sm',
                selectedCategory === category || (category === 'الكل' && !selectedCategory)
                  ? 'bg-gradient-gold text-black border-gold shadow-gold scale-105'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary border-border hover:border-gold/50'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Carousels */}
        {loading && products.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-6 mt-8 -mx-2 px-1 md:mx-0 md:px-4">
            {products.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/catalog')}
              className="px-8 py-3 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-bold"
            >
              تصفح كل المنتجات
            </button>
          </div>
        )}

        {loading && products.length > 0 && (
          <div className="text-center mt-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">لا توجد منتجات في هذا التصنيف</p>
          </div>
        )}
      </div>
    </section >
  );
};

export default ProductGrid;
