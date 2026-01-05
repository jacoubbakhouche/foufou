-- Function to handle stock updates based on order changes
CREATE OR REPLACE FUNCTION handle_stock_update() RETURNS TRIGGER 
SECURITY DEFINER -- IMPORTANT: Runs with privileges of the function creator (admin), bypassing RLS
AS $$
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
      product_id := (item->'product'->>'id')::uuid;
      item_quantity := (item->>'quantity')::int;
      
      -- Update the product stock (Bypassing RLS due to SECURITY DEFINER)
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
    
    -- Case 2: Order Un-cancelled (e.g. from Cancelled to Pending/Confirmed) -> Deduct Stock Again
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

-- Drop and Re-create Trigger
DROP TRIGGER IF EXISTS on_order_stock_change ON orders;

CREATE TRIGGER on_order_stock_change
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_stock_update();
