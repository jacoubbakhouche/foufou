-- Final Robust Version of Stock Update Trigger
-- 1. Ensure the function runs as Admin (SECURITY DEFINER)
-- 2. Handle both INSERT and UPDATE (Status Change)
-- 3. Robust JSON extraction

CREATE OR REPLACE FUNCTION handle_stock_update() RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public -- Secure search path
AS $$
DECLARE
  item jsonb;
  item_qty int;
  prod_id uuid;
BEGIN
  -- ------------------------------------------------------------------
  -- HANDLE NEW ORDERS (DEDUCT STOCK)
  -- ------------------------------------------------------------------
  IF (TG_OP = 'INSERT') THEN
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Extract ID and Quantity safely
      prod_id := (item->'product'->>'id')::uuid;
      item_qty := (item->>'quantity')::int;

      -- Deduct quantity logic
      UPDATE products 
      SET stock_quantity = stock_quantity - item_qty
      WHERE id = prod_id;
    END LOOP;
  
  -- ------------------------------------------------------------------
  -- HANDLE ORDER UPDATES (CANCEL / RESTORE)
  -- ------------------------------------------------------------------
  ELSIF (TG_OP = 'UPDATE') THEN
    
    -- CASE A: Order was Cancelled (Restore Stock)
    -- We check if status changed TO 'cancelled'
    IF (NEW.status = 'cancelled' AND OLD.status != 'cancelled') THEN
      FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        prod_id := (item->'product'->>'id')::uuid;
        item_qty := (item->>'quantity')::int;

        UPDATE products 
        SET stock_quantity = stock_quantity + item_qty
        WHERE id = prod_id;
      END LOOP;
      
    -- CASE B: Order was Un-Cancelled (Deduct Stock Again)
    -- We check if status changed FROM 'cancelled' to something else (e.g. pending/confirmed)
    ELSIF (NEW.status != 'cancelled' AND OLD.status = 'cancelled') THEN
      FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        prod_id := (item->'product'->>'id')::uuid;
        item_qty := (item->>'quantity')::int;

        UPDATE products 
        SET stock_quantity = stock_quantity - item_qty
        WHERE id = prod_id;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach the trigger
DROP TRIGGER IF EXISTS on_order_stock_change ON orders;

CREATE TRIGGER on_order_stock_change
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_stock_update();
