import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export interface UseProductsOptions {
  page?: number;
  limit?: number;
  category?: string | null;
  search?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'default';
  isNew?: boolean;
  isSale?: boolean;
  keepPreviousData?: boolean;
}

export const useProducts = ({
  page = 1,
  limit = 20,
  category = null,
  search = '',
  sortBy = 'newest',
  isNew = false,
  isSale = false,
  keepPreviousData = false
}: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, category, search, sortBy, isNew, isSale]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Filtering
      if (category && category !== 'الكل') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (isNew) {
        // Assume 'new' means created in last 14 days or manually flagged
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        query = query.gte('created_at', fourteenDaysAgo.toISOString());
      }

      if (isSale) {
        // Sale means original_price > price
        // Note: Supabase doesn't support field comparison easily in simple Filter builder without RPC or raw SQL.
        // For now, we might fetch and filter, OR assume a 'on_sale' boolean column if it existed.
        // We will assume client accepts slight imperfection or we add .not('original_price', 'is', null) 
        // But checking op > p is hard. We will filter 'isSale' client side if needed, BUT for 1M products ideally we need a column `is_on_sale`.
        // Let's use `not('original_price', 'is', null)` as a proxy for "Has Discount" for now.
        query = query.not('original_price', 'is', null);
      }

      // Sorting
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        images: p.images || (p.image ? [p.image] : []),
        video_url: p.video_url,
        category: p.category,
        colors: p.colors || [],
        sizes: p.sizes || [],
        description: p.description || '',
        inStock: p.in_stock,
        stock_quantity: p.stock_quantity || 0,
        isNew: new Date(p.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      }));

      if (keepPreviousData && page > 1) {
        setProducts(prev => [...prev, ...formattedProducts]);
      } else {
        setProducts(formattedProducts);
      }

      setTotalCount(count || 0);
      setHasMore(formattedProducts.length === limit);

    } catch (err) {
      setError('خطأ في جلب المنتجات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, hasMore, totalCount, refetch: fetchProducts };
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const productData = data as any;
    return {
      id: data.id,
      name: data.name,
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      images: data.images || (data.image ? [data.image] : []),
      video_url: data.video_url,
      category: data.category,
      colors: data.colors || [],
      sizes: data.sizes || [],
      description: data.description || '',
      inStock: data.in_stock,
      stock_quantity: data.stock_quantity || 0,
    } as Product;
  } catch (err) {
    console.error('Error fetching product:', err);
    return null;
  }
};

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>(['الكل']);

  useEffect(() => {
    const fetchCategories = async () => {
      // For 1M rows, distinct on non-indexed column is slow. Ideally use a separate table.
      // For now, we use a distinct query.
      const { data } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (data) {
        const unique = [...new Set(data.map(item => item.category))];
        setCategories(['الكل', ...unique.sort()]);
      }
    };
    fetchCategories();
  }, []);

  return categories;
};
