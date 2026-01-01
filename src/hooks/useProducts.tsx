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

      const formattedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        images: p.images || (p.image ? [p.image] : []),
        category: p.category,
        colors: p.colors || [],
        sizes: p.sizes || [],
        description: p.description || '',
        inStock: p.in_stock,
      }));

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

    return {
      id: data.id,
      name: data.name,
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      images: data.images || (data.image ? [data.image] : []),
      category: data.category,
      colors: data.colors || [],
      sizes: data.sizes || [],
      description: data.description || '',
      inStock: data.in_stock,
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
