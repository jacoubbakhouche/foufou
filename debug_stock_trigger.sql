-- Create a logs table to debug trigger execution
CREATE TABLE IF NOT EXISTS debug_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    message text,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

-- Function to handle stock updates with DEBUGGING
CREATE OR REPLACE FUNCTION handle_stock_update() RETURNS TRIGGER 
SECURITY DEFINER
AS $$
DECLARE
  item jsonb;
  item_quantity int;
  product_id uuid;
  log_details jsonb;
BEGIN
  -- Log the start of the function
  INSERT INTO debug_logs (message, details) VALUES ('Trigger Started', jsonb_build_object('op', TG_OP, 'new_status', NEW.status, 'items', NEW.items));

  -- Handle INSERT
  IF (TG_OP = 'INSERT') THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      product_id := (item->'product'->>'id')::uuid;
      item_quantity := (item->>'quantity')::int;
      
      -- Log extraction
      INSERT INTO debug_logs (message, details) VALUES ('Processing Item', jsonb_build_object('product_id', product_id, 'quantity', item_quantity));

      -- Update the product stock
      UPDATE products
      SET stock_quantity = stock_quantity - item_quantity
      WHERE id = product_id;
      
      -- Log result
      IF FOUND THEN
         INSERT INTO debug_logs (message, details) VALUES ('Stock Updated', jsonb_build_object('product_id', product_id, 'deducted', item_quantity));
      ELSE
         INSERT INTO debug_logs (message, details) VALUES ('Product Not Found or Update Failed', jsonb_build_object('product_id', product_id));
      END IF;
    END LOOP;
  
  -- Handle UPDATE
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.status = 'cancelled' AND OLD.status != 'cancelled') THEN
       INSERT INTO debug_logs (message, details) VALUES ('Order Cancelled - Restoring Stock', jsonb_build_object('id', NEW.id));
       -- ... (restoration logic) ...
       FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
       LOOP
          product_id := (item->'product'->>'id')::uuid;
          item_quantity := (item->>'quantity')::int;
          UPDATE products SET stock_quantity = stock_quantity + item_quantity WHERE id = product_id;
       END LOOP;
    ELSIF (NEW.status != 'cancelled' AND OLD.status = 'cancelled') THEN
       INSERT INTO debug_logs (message, details) VALUES ('Order Un-cancelled - Deducting Stock', jsonb_build_object('id', NEW.id));
       -- ... (deduction logic) ...
       FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
       LOOP
          product_id := (item->'product'->>'id')::uuid;
          item_quantity := (item->>'quantity')::int;
          UPDATE products SET stock_quantity = stock_quantity - item_quantity WHERE id = product_id;
       END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO debug_logs (message, details) VALUES ('Error in Trigger', jsonb_build_object('error', SQLERRM, 'state', SQLSTATE));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create Trigger
DROP TRIGGER IF EXISTS on_order_stock_change ON orders;
CREATE TRIGGER on_order_stock_change
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_stock_update();
