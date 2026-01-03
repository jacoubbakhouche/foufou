import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import ProductCarousel from '@/components/ProductCarousel';
import { cn } from '@/lib/utils';

const ProductGrid = () => {
  const { products, loading } = useProducts();
  const categories = useCategories(products);
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const filteredProducts =
    selectedCategory === 'الكل'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Chunk products into groups of 20
  const chunkProducts = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const productGroups = chunkProducts(filteredProducts, 6);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

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
        <div id="categories" className="flex flex-wrap justify-center gap-2 mb-10 px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300',
                selectedCategory === category
                  ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Carousels */}
        <div className="space-y-16">
          {productGroups.map((group, index) => (
            <div key={index} className="relative">
              {productGroups.length > 1 && (
                <div className="flex items-center gap-4 mb-6 px-4">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-bold text-muted-foreground whitespace-nowrap px-4 py-1 bg-secondary rounded-full">
                    المجموعة {index + 1}
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>
              )}
              <ProductCarousel products={group} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">لا توجد منتجات في هذا التصنيف</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
