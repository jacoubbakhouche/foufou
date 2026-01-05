-- Function to handle stock updates based on order changes
CREATE OR REPLACE FUNCTION handle_stock_update() RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
  item_quantity int;
  product_id uuid;
BEGIN
  -- Handle INSERT: Deduct stock automatically when a new order is created
  IF (TG_OP = 'INSERT') THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Extract product ID and quantity from the JSONB item
      -- Structure matches OrderModal.tsx: items[{ product: { id: ... }, quantity: ... }]
      product_id := (item->'product'->>'id')::uuid;
      item_quantity := (item->>'quantity')::int;
      
      -- Update the product stock
      UPDATE products
      SET stock_quantity = stock_quantity - item_quantity
      WHERE id = product_id;
    END LOOP;
  
  -- Handle UPDATE: Restore stock if cancelled, or other status changes
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Case 1: Order Cancelled -> Restore Stock
    IF (NEW.status = 'cancelled' AND OLD.status != 'cancelled') THEN
      FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        product_id := (item->'product'->>'id')::uuid;
        item_quantity := (item->>'quantity')::int;
        
        UPDATE products
        SET stock_quantity = stock_quantity + item_quantity
        WHERE id = product_id;
      END LOOP;
    
    -- Case 2: Order Un-cancelled (e.g. from Cancelled to Pending) -> Deduct Stock Again
    ELSIF (NEW.status != 'cancelled' AND OLD.status = 'cancelled') THEN
      FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        product_id := (item->'product'->>'id')::uuid;
        item_quantity := (item->>'quantity')::int;
        
        UPDATE products
        SET stock_quantity = stock_quantity - item_quantity
        WHERE id = product_id;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to ensure clean state
DROP TRIGGER IF EXISTS on_order_stock_change ON orders;

-- Create the trigger for both INSERT and UPDATE
CREATE TRIGGER on_order_stock_change
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_stock_update();
