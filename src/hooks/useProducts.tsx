import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map((p: any) => {
        // Calculate isNew based on created_at (e.g., last 14 days)
        const createdAt = new Date(p.created_at);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 4);
        const isNew = createdAt > fourteenDaysAgo;

        return {
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
          isNew: isNew,
        };
      });

      setProducts(formattedProducts);
    } catch (err) {
      setError('خطأ في جلب المنتجات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
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

export const useCategories = (products: Product[]) => {
  const categories = ['الكل', ...new Set(products.map(p => p.category))];
  return categories;
};
