-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    colors TEXT[] NOT NULL DEFAULT '{}',
    sizes TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view products
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

-- Only admins can insert/update/delete products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can create orders (guest checkout)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Only admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update orders
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial products from static data
INSERT INTO public.products (name, price, original_price, image, category, colors, sizes, description, in_stock) VALUES
('قميص كلاسيكي أزرق', 299, 399, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500', 'قمصان', ARRAY['أزرق', 'أبيض', 'أسود'], ARRAY['S', 'M', 'L', 'XL'], 'قميص رجالي كلاسيكي من القطن الفاخر', true),
('بنطلون جينز عصري', 449, NULL, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'بناطيل', ARRAY['أزرق داكن', 'أسود', 'رمادي'], ARRAY['30', '32', '34', '36'], 'جينز مريح بقصة عصرية', true),
('تيشيرت قطني أبيض', 149, 199, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'تيشيرتات', ARRAY['أبيض', 'أسود', 'رمادي', 'بيج'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'تيشيرت قطني ناعم للاستخدام اليومي', true),
('جاكيت جلد بني', 899, NULL, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', 'جاكيتات', ARRAY['بني', 'أسود'], ARRAY['M', 'L', 'XL'], 'جاكيت جلد أصلي بتصميم أنيق', true),
('سترة صوف رمادية', 549, 699, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500', 'سترات', ARRAY['رمادي', 'كحلي', 'بيج'], ARRAY['S', 'M', 'L', 'XL'], 'سترة صوف دافئة للشتاء', true),
('شورت رياضي', 179, NULL, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500', 'ملابس رياضية', ARRAY['أسود', 'رمادي', 'أزرق'], ARRAY['S', 'M', 'L', 'XL'], 'شورت رياضي مريح للتمارين', true);

-- Insert admin role for the specified email (will be activated when user signs up)
-- We'll use a trigger to automatically assign admin role when this email signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Check if this is the admin email
    IF NEW.email = 'yakoubbakhouche011@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin');
    ELSE
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user');
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger to assign role when user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();